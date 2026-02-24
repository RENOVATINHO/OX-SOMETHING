// ==============================
// NovoPastoPage.tsx — Tela de cadastro de pasto com mapa interativo
// Permite ao usuário demarcar um pasto clicando no mapa para formar um polígono,
// calcula a área automaticamente e salva no banco de dados.
// Inspirado no app Field Area Measure.
// ==============================

import { useState, useRef, useEffect, useCallback } from "react";
import L from "leaflet";                    // Biblioteca de mapas interativos (OpenStreetMap)
import "leaflet/dist/leaflet.css";           // Estilos necessários para renderizar o mapa corretamente
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Save, MapPin, Undo2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ==============================
// Interface que define a estrutura de um ponto geográfico (vértice do polígono)
// ==============================
interface LatLng {
  lat: number;   // Latitude — coordenada norte/sul
  lng: number;   // Longitude — coordenada leste/oeste
}

// ==============================
// Interface que define a estrutura de um pasto salvo no banco de dados
// ==============================
interface PastoSalvo {
  id: string;
  nome: string;
  coordenadas: LatLng[];     // Array de vértices que formam o polígono
  area_hectares: number;
  area_m2: number;
  created_at: string;
}

// ==============================
// Função utilitária: calcula a área de um polígono usando a Fórmula de Shoelace
// adaptada para coordenadas geográficas (lat/lng → metros)
// Referência: https://en.wikipedia.org/wiki/Shoelace_formula
// ==============================
const calcularAreaM2 = (pontos: LatLng[]): number => {
  // Necessita de pelo menos 3 pontos para formar um polígono válido
  if (pontos.length < 3) return 0;

  // Fator de conversão: 1 grau de latitude ≈ 111.320 metros
  const R = 6371000; // Raio médio da Terra em metros

  // Converte graus para radianos — necessário para funções trigonométricas
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Latitude média do polígono — usada para corrigir a distorção na longitude
  // (quanto mais longe do equador, menor a distância real por grau de longitude)
  const latMedia = toRad(
    pontos.reduce((sum, p) => sum + p.lat, 0) / pontos.length
  );

  // Converte cada ponto de lat/lng para coordenadas planas em metros (projeção simplificada)
  const coords = pontos.map((p) => ({
    x: toRad(p.lng) * R * Math.cos(latMedia), // Longitude → metros (corrigida pela latitude)
    y: toRad(p.lat) * R,                       // Latitude → metros
  }));

  // Aplica a Fórmula de Shoelace para calcular a área do polígono
  // Soma os produtos cruzados de cada par de vértices consecutivos
  let area = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length; // Próximo vértice (volta ao primeiro no final)
    area += coords[i].x * coords[j].y; // Produto cruzado positivo
    area -= coords[j].x * coords[i].y; // Produto cruzado negativo
  }

  // O valor absoluto dividido por 2 dá a área real do polígono
  return Math.abs(area) / 2;
};

// ==============================
// Componente principal: NovoPastoPage
// ==============================
const NovoPastoPage = () => {
  const { toast } = useToast(); // Hook para exibir notificações ao usuário

  // ---- Estados do formulário ----
  const [nome, setNome] = useState("");               // Nome do pasto digitado pelo usuário
  const [pontos, setPontos] = useState<LatLng[]>([]);  // Array de pontos marcados no mapa
  const [salvando, setSalvando] = useState(false);     // Flag: indica se está salvando no banco

  // ---- Estados de visualização ----
  const [pastosVisiveis, setPastosVisiveis] = useState<PastoSalvo[]>([]); // Pastos já salvos para exibir no mapa
  const [dialogAberto, setDialogAberto] = useState(false);                // Controla o dialog de pastos salvos

  // ---- Referências do mapa (não disparam re-render ao mudar) ----
  const mapRef = useRef<L.Map | null>(null);           // Instância do mapa Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null); // Div onde o mapa é renderizado
  const markersRef = useRef<L.CircleMarker[]>([]);       // Marcadores circulares dos vértices do polígono
  const polylineRef = useRef<L.Polyline | null>(null);  // Linha que conecta os pontos
  const polygonRef = useRef<L.Polygon | null>(null);    // Polígono preenchido (quando fechado)
  const pastosLayersRef = useRef<L.Polygon[]>([]);      // Camadas dos pastos salvos exibidos no mapa

  // ---- Cálculos derivados da área ----
  const areaM2 = calcularAreaM2(pontos);                          // Área em metros quadrados
  const areaHectares = areaM2 / 10000;                             // 1 hectare = 10.000 m²
  const poligonoFechado = pontos.length >= 3;                      // Mínimo de 3 pontos para fechar

  // ==============================
  // Função: atualiza as formas desenhadas no mapa (marcadores, linhas, polígono)
  // Chamada toda vez que o array de pontos muda
  // ==============================
  const atualizarFormasNoMapa = useCallback(
    (pontosAtuais: LatLng[]) => {
      const map = mapRef.current;
      if (!map) return;

      // 1. Remove todos os marcadores anteriores do mapa
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // 2. Remove a polyline anterior (linha conectando os pontos)
      if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }

      // 3. Remove o polígono preenchido anterior
      if (polygonRef.current) {
        polygonRef.current.remove();
        polygonRef.current = null;
      }

      // Se não há pontos, nada mais a fazer
      if (pontosAtuais.length === 0) return;

      // 4. Cria um marcador circular para cada ponto (vértice do polígono)
      pontosAtuais.forEach((p, idx) => {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 8,                    // Tamanho do círculo em pixels
          color: "#16a34a",             // Cor da borda (verde)
          fillColor: idx === 0 ? "#facc15" : "#22c55e", // Primeiro ponto em amarelo (referência visual)
          fillOpacity: 0.9,
          weight: 2,                    // Espessura da borda
        }).addTo(map);

        // Tooltip com o número do ponto — aparece ao passar o mouse
        marker.bindTooltip(`Ponto ${idx + 1}`, {
          permanent: false,
          direction: "top",
        });

        markersRef.current.push(marker);
      });

      // 5. Converte os pontos para o formato que o Leaflet espera [lat, lng]
      const latlngs: L.LatLngExpression[] = pontosAtuais.map((p) => [
        p.lat,
        p.lng,
      ]);

      // 6. Se há 3+ pontos, desenha o polígono preenchido (área demarcada)
      if (pontosAtuais.length >= 3) {
        polygonRef.current = L.polygon(latlngs, {
          color: "#16a34a",        // Cor da borda do polígono
          fillColor: "#22c55e",    // Cor de preenchimento (verde claro)
          fillOpacity: 0.25,       // Transparência do preenchimento (25%)
          weight: 2,
        }).addTo(map);
      } else if (pontosAtuais.length >= 2) {
        // Se há apenas 2 pontos, desenha apenas uma linha entre eles
        polylineRef.current = L.polyline(latlngs, {
          color: "#16a34a",
          weight: 2,
          dashArray: "6, 6", // Linha tracejada para indicar que ainda não é um polígono
        }).addTo(map);
      }
    },
    []
  );

  // ==============================
  // Efeito: inicializa o mapa Leaflet uma única vez quando o componente monta
  // ==============================
  useEffect(() => {
    // Evita inicializar duas vezes (ex: React Strict Mode em dev)
    if (!mapContainerRef.current || mapRef.current) return;

    // Cria a instância do mapa centrada em coordenadas genéricas do Brasil Central
    const map = L.map(mapContainerRef.current, {
      center: [-15.7801, -47.9292], // Brasília como centro padrão
      zoom: 13,                      // Nível de zoom inicial (bairro/cidade)
      zoomControl: true,             // Mostra controles de zoom (+/-)
    });

    // Adiciona o layer de tiles do OpenStreetMap (mapa base gratuito)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19, // Zoom máximo suportado pelo OpenStreetMap
    }).addTo(map);

    // Tenta obter a localização real do usuário via GPS/rede
    map.locate({ setView: true, maxZoom: 16 });

    // Quando a localização é encontrada, centraliza o mapa e adiciona um marcador azul
    map.on("locationfound", (e: L.LocationEvent) => {
      L.circleMarker(e.latlng, {
        radius: 10,
        color: "#3b82f6",        // Azul para diferenciar da marcação do pasto
        fillColor: "#3b82f6",
        fillOpacity: 0.5,
      })
        .addTo(map)
        .bindPopup("📍 Sua localização atual") // Popup informativo
        .openPopup();
    });

    // Se falhar ao obter localização, exibe aviso (não impede o uso)
    map.on("locationerror", () => {
      console.warn("Não foi possível obter a localização do dispositivo.");
    });

    // ---- Handler de clique no mapa: adiciona um novo ponto ao polígono ----
    map.on("click", (e: L.LeafletMouseEvent) => {
      const novoPonto: LatLng = { lat: e.latlng.lat, lng: e.latlng.lng };

      // Usa callback do setState para garantir que temos o estado mais recente
      setPontos((prev) => {
        const novosPontos = [...prev, novoPonto];
        // Atualiza as formas visuais no mapa com os novos pontos
        atualizarFormasNoMapa(novosPontos);
        return novosPontos;
      });
    });

    // Armazena a referência do mapa para uso em outros efeitos/funções
    mapRef.current = map;

    // Cleanup: destrói o mapa quando o componente desmonta (evita memory leaks)
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [atualizarFormasNoMapa]);

  // ==============================
  // Função: remove o último ponto adicionado (Ctrl+Z do mapa)
  // ==============================
  const desfazerUltimoPonto = () => {
    setPontos((prev) => {
      const novosPontos = prev.slice(0, -1); // Remove o último elemento do array
      atualizarFormasNoMapa(novosPontos);
      return novosPontos;
    });
  };

  // ==============================
  // Função: limpa todos os pontos e formas do mapa (recomeça do zero)
  // ==============================
  const limparMapa = () => {
    setPontos([]);
    atualizarFormasNoMapa([]);
  };

  // ==============================
  // Função: carrega e exibe no mapa todos os pastos já salvos no banco de dados
  // ==============================
  const verPastosSalvos = async () => {
    // Busca todos os pastos ordenados por data de criação (mais recentes primeiro)
    const { data, error } = await supabase
      .from("pastos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar pastos",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Cast seguro dos dados retornados para a interface PastoSalvo
    const pastos = (data || []).map((p: any) => ({
      ...p,
      coordenadas: p.coordenadas as LatLng[],
    })) as PastoSalvo[];

    setPastosVisiveis(pastos);

    // Remove pastos anteriormente exibidos no mapa (evita duplicação)
    pastosLayersRef.current.forEach((layer) => layer.remove());
    pastosLayersRef.current = [];

    // Desenha cada pasto salvo como um polígono no mapa
    if (mapRef.current && pastos.length > 0) {
      pastos.forEach((pasto) => {
        const latlngs: L.LatLngExpression[] = pasto.coordenadas.map((c) => [
          c.lat,
          c.lng,
        ]);

        // Cria o polígono com cor azul para diferenciar do pasto em edição (verde)
        const poly = L.polygon(latlngs, {
          color: "#2563eb",        // Azul — pastos salvos
          fillColor: "#3b82f6",
          fillOpacity: 0.2,
          weight: 2,
        }).addTo(mapRef.current!);

        // Popup com informações do pasto ao clicar no polígono
        poly.bindPopup(
          `<strong>${pasto.nome}</strong><br/>` +
            `Área: ${pasto.area_hectares.toFixed(2)} ha<br/>` +
            `(${pasto.area_m2.toFixed(0)} m²)`
        );

        pastosLayersRef.current.push(poly);
      });

      // Ajusta o zoom do mapa para mostrar todos os pastos salvos
      const allBounds = L.featureGroup(pastosLayersRef.current).getBounds();
      mapRef.current.fitBounds(allBounds, { padding: [50, 50] });
    }

    // Abre o dialog com a lista de pastos salvos
    setDialogAberto(true);
  };

  // ==============================
  // Função: salva o pasto demarcado no banco de dados
  // ==============================
  const salvarPasto = async () => {
    // ---- Validações antes de salvar ----
    if (!nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para o pasto.",
        variant: "destructive",
      });
      return;
    }

    if (pontos.length < 3) {
      toast({
        title: "Demarcação incompleta",
        description: "Marque pelo menos 3 pontos no mapa para formar o polígono.",
        variant: "destructive",
      });
      return;
    }

    setSalvando(true); // Ativa o spinner/loading do botão

    // Insere o pasto no banco de dados com nome, coordenadas e áreas calculadas
    const { error } = await supabase.from("pastos").insert([{
      nome: nome.trim(),
      coordenadas: pontos as any,                 // JSONB — array de {lat, lng}
      area_hectares: parseFloat(areaHectares.toFixed(4)),
      area_m2: parseFloat(areaM2.toFixed(2)),
    }]);

    setSalvando(false); // Desativa o loading independente do resultado

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Sucesso! Notifica o usuário e limpa o formulário para novo cadastro
    toast({ title: "Pasto salvo com sucesso! ✅" });
    setNome("");
    limparMapa();
  };

  // ==============================
  // Renderização do componente
  // ==============================
  return (
    <AppLayout title="Novo Pasto">
      <div className="space-y-4">
        {/* ---- Cabeçalho: campo de nome + botão ver pastos salvos ---- */}
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Campo de texto para o nome do pasto */}
          <div className="flex-1 w-full">
            <Label htmlFor="nome-pasto" className="text-sm font-medium text-foreground">
              Nome do Pasto
            </Label>
            <Input
              id="nome-pasto"
              placeholder="Ex: Pasto Norte, Área 3..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="mt-1"
            />
          </div>
          {/* Botão para visualizar pastos já cadastrados no banco */}
          <Button variant="outline" onClick={verPastosSalvos} className="gap-2">
            <Eye size={16} />
            Ver Salvos
          </Button>
        </div>

        {/* ---- Instruções de uso do mapa ---- */}
        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <MapPin size={16} className="text-primary shrink-0" />
            {/* Instrução contextual: muda conforme o usuário avança na demarcação */}
            {pontos.length === 0
              ? "Clique no mapa para marcar os pontos do pasto. O primeiro ponto fica em amarelo."
              : pontos.length < 3
              ? `${pontos.length} ponto(s) marcado(s). Marque pelo menos 3 para formar o polígono.`
              : `${pontos.length} pontos marcados — polígono formado! Você pode adicionar mais pontos ou salvar.`}
          </p>
        </div>

        {/* ---- Container do mapa Leaflet ---- */}
        {/* A altura fixa garante que o mapa sempre seja visível, mesmo em telas menores */}
        <div
          ref={mapContainerRef}
          className="w-full rounded-xl border border-border overflow-hidden"
          style={{ height: "55vh", minHeight: 350 }}
        />

        {/* ---- Painel de informações da área calculada ---- */}
        {poligonoFechado && (
          <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-2 gap-4">
            {/* Área em hectares — unidade mais comum para propriedades rurais */}
            <div>
              <p className="text-xs text-muted-foreground">Área (hectares)</p>
              <p className="text-xl font-bold text-primary">
                {areaHectares.toFixed(4)} ha
              </p>
            </div>
            {/* Área em metros quadrados — para maior precisão */}
            <div>
              <p className="text-xs text-muted-foreground">Área (m²)</p>
              <p className="text-xl font-bold text-foreground">
                {areaM2.toFixed(2)} m²
              </p>
            </div>
          </div>
        )}

        {/* ---- Botões de ação: Desfazer, Limpar, Salvar ---- */}
        <div className="flex flex-wrap gap-3">
          {/* Desfazer: remove o último ponto (habilitado apenas se há pontos) */}
          <Button
            variant="outline"
            onClick={desfazerUltimoPonto}
            disabled={pontos.length === 0}
            className="gap-2"
          >
            <Undo2 size={16} />
            Desfazer
          </Button>

          {/* Limpar: remove todos os pontos e recomeça a demarcação */}
          <Button
            variant="destructive"
            onClick={limparMapa}
            disabled={pontos.length === 0}
            className="gap-2"
          >
            <Trash2 size={16} />
            Limpar
          </Button>

          {/* Salvar: grava o pasto no banco de dados (habilitado com 3+ pontos e nome) */}
          <Button
            onClick={salvarPasto}
            disabled={pontos.length < 3 || !nome.trim() || salvando}
            className="gap-2 ml-auto"
          >
            <Save size={16} />
            {salvando ? "Salvando..." : "Salvar Pasto"}
          </Button>
        </div>
      </div>

      {/* ==============================
          Dialog: lista de pastos salvos no banco de dados
          Permite ao usuário ver todos os pastos já cadastrados
          ============================== */}
      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pastos Salvos</DialogTitle>
            <DialogDescription>
              Pastos cadastrados no sistema. Clique no mapa para visualizá-los.
            </DialogDescription>
          </DialogHeader>

          {/* Lista de pastos — se vazia, mostra mensagem informativa */}
          {pastosVisiveis.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum pasto cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {pastosVisiveis.map((p) => (
                <div
                  key={p.id}
                  className="border border-border rounded-lg p-3 bg-muted/30"
                >
                  {/* Nome do pasto */}
                  <p className="font-semibold text-foreground">{p.nome}</p>
                  {/* Informações de área e data */}
                  <p className="text-xs text-muted-foreground mt-1">
                    {p.area_hectares.toFixed(4)} ha • {p.area_m2.toFixed(0)} m²
                    {" • "}
                    {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default NovoPastoPage;
