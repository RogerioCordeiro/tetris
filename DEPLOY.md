# Deploy Instructions

Este projeto está configurado para fazer deploy automático no GitHub Pages quando há merge da branch `develop` para a `main`.

## Configuração necessária no GitHub

### 1. Habilitar GitHub Pages

1. Vá para as configurações do repositório no GitHub
2. Navegue até a seção "Pages" no menu lateral
3. Em "Source", selecione "GitHub Actions"

### 2. Configurar as permissões (se necessário)

Se você tiver problemas com permissões, certifique-se de que:

1. Nas configurações do repositório, vá para "Actions" > "General"
2. Em "Workflow permissions", selecione "Read and write permissions"
3. Marque "Allow GitHub Actions to create and approve pull requests"

## Como funciona o deploy

O workflow de deploy (`deploy-pages.yml`) será executado automaticamente quando:

- Houver um push direto na branch `main`
- Houver um merge de Pull Request na branch `main`

### Processo do deploy:

1. **Build**: O projeto é construído usando `npm run build`
2. **Export**: Next.js gera os arquivos estáticos na pasta `out/`
3. **Deploy**: Os arquivos são enviados para o GitHub Pages

## Configurações importantes

### Next.js Configuration

O arquivo `next.config.js` está configurado para:

- `output: 'export'` - Gera arquivos estáticos
- `trailingSlash: true` - Adiciona barras no final das URLs
- `images: { unoptimized: true }` - Desabilita otimização de imagens para exportação estática

### Base Path (se necessário)

Se o repositório não for nomeado `username.github.io`, descomente as linhas no `next.config.js`:

```javascript
basePath: '/tetris',
assetPrefix: '/tetris/',
```

Substitua `/tetris` pelo nome do seu repositório.

## Testando localmente

Para testar a build de produção localmente:

```bash
npm run build
npx serve out
```

## URL do deploy

Após o primeiro deploy bem-sucedido, o site estará disponível em:
- `https://username.github.io/tetris` (se for um repositório comum)
- `https://username.github.io` (se o repositório se chamar `username.github.io`)

## Troubleshooting

### Erro 404 nas páginas

Se você receber erro 404 ao navegar:

1. Verifique se `basePath` e `assetPrefix` estão configurados corretamente
2. Certifique-se de que `trailingSlash: true` está ativo

### Problemas com imagens

Se as imagens não carregarem:

1. Verifique se `images: { unoptimized: true }` está no config
2. Use paths relativos para imagens em `public/`

### Workflow não executa

1. Verifique as permissões do repositório
2. Certifique-se de que GitHub Actions está habilitado
3. Verifique se a branch `main` existe e está como branch padrão
