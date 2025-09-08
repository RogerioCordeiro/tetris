# Sistema de Tradução - Tetris

## Visão Geral

O jogo Tetris agora possui um sistema completo de internacionalização (i18n) que permite alternar entre diferentes idiomas durante o jogo.

## Idiomas Disponíveis

- 🇧🇷 **Português (Brasil)** - Idioma padrão
- 🇺🇸 **English** - Inglês

## Características

### 1. **Seletor de Idioma**

- Botão com ícone de globo e bandeira do idioma atual
- Menu dropdown com lista de idiomas disponíveis
- Localizado na parte inferior direita da tela junto aos controles

### 2. **Persistência**

- O idioma selecionado é salvo no localStorage
- A preferência é mantida entre sessões do jogo

### 3. **Traduções Dinâmicas**

- Todos os textos da interface são traduzidos instantaneamente
- Não requer recarregamento da página

## Textos Traduzidos

### Interface do Jogo

- Título das seções (Hold, Next, Controles)
- Status do jogo (Game Over, Pausado)
- Botões (Jogar Novamente, Reiniciar)
- Estatísticas (Nível, Pontuação, Recorde, Linhas)

### Controles

- Título da seção de controles
- Descrição de cada comando:
  - Mover/Girar
  - Queda rápida
  - Segurar peça
  - Pausar

## Estrutura Técnica

### Arquivos de Configuração

```
src/lib/i18n/
├── config.ts           # Configuração de idiomas disponíveis
├── context.tsx         # Contexto React para gerenciar estado
├── useTranslation.ts   # Hook para acessar traduções
├── index.ts            # Arquivo de índice para exports
└── locales/
    ├── pt-br.json      # Traduções em português
    └── en.json         # Traduções em inglês
```

### Componentes

```
src/components/
└── LanguageSelector.tsx # Componente de seleção de idioma
```

## Como Usar

### Para Usuários

1. Procure o botão com ícone de globo 🌐 na parte inferior direita
2. Clique no botão para abrir o menu de idiomas
3. Selecione o idioma desejado
4. A interface será atualizada instantaneamente

### Para Desenvolvedores

#### Adicionando Novas Traduções

1. Edite os arquivos JSON em `src/lib/i18n/locales/`
2. Mantenha a mesma estrutura em todos os idiomas
3. Use o hook `useTranslation` nos componentes:

```tsx
import { useTranslation } from "@/lib/i18n";

function MeuComponente() {
  const { t } = useTranslation();

  return <div>{t("game.title")}</div>;
}
```

#### Adicionando Novos Idiomas

1. Adicione o idioma em `src/lib/i18n/config.ts`
2. Crie o arquivo JSON correspondente em `locales/`
3. Importe e adicione as traduções no `context.tsx`

## Exemplo de Uso

```tsx
// Usando traduções em um componente
const { t } = useTranslation();

return (
  <div>
    <h1>{t("game.title")}</h1>
    <p>
      {t("game.score")}: {score}
    </p>
    <button>{t("game.playAgain")}</button>
  </div>
);
```

## Navegação por Dot Notation

O sistema suporta navegação aninhada usando ponto (.) como separador:

```json
{
  "game": {
    "status": {
      "gameOver": "Fim de Jogo!"
    }
  }
}
```

```tsx
t("game.status.gameOver"); // "Fim de Jogo!"
```

## Características Técnicas

- **TypeScript**: Totalmente tipado com autocompletar
- **Performance**: Traduções carregadas sob demanda
- **Acessibilidade**: Interface responsiva e clara
- **UX**: Transições suaves e feedback visual
- **Persistência**: Configuração salva no navegador
