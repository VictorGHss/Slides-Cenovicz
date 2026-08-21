# 📺 Cenovicz Oftalmologia - Apresentação Smart TV

Aplicação web moderna de Digital Signage / Slideshow para recepção e salas de espera da **Cenovicz Oftalmologia**, desenvolvida para rodar perfeitamente no navegador de qualquer Smart TV (Samsung Tizen, LG webOS, Android TV, Fire TV, etc.) e pronta para hospedagem gratuita no **GitHub Pages**.

---

## 🌟 Funcionalidades

- **Otimizado para Smart TV**: Funciona direto no navegador nativo da TV com suporte a tela cheia.
- **Loop Infinito e Auto-Play**: Transição suave e contínua entre os slides sem engasgos ou telas pretas.
- **HUD Invisível (Auto-Hide)**: Os controles, relógio e contadores somem automaticamente após 3 segundos sem toque/mouse para deixar a tela 100% limpa.
- **Relógio & Data em Tempo Real**: Widget discreto no canto superior com hora e data da clínica (ideal para sala de espera).
- **Barra de Progresso Fluida**: Indicador elegante do tempo restante de cada slide.
- **Suporte a Controle Remoto e Teclado**:
  - `→` ou `Enter`: Próximo slide
  - `←`: Slide anterior
  - `Espaço` ou `Tecla Play/Pause`: Pausar / Retomar apresentação
  - `F`: Alternar Modo Tela Cheia
  - `G`: Abrir grade visual de todos os slides para escolher um slide específico
  - `S`: Menu de configurações
- **Prevenção de Descanso de Tela**: Utiliza a *Screen Wake Lock API* para manter a TV sempre ligada sem ativar o protetor de tela.
- **Auto-Recarga para TV 24/7**: Limpeza automática de memória após 6 horas para evitar travamentos em navegadores de TV.
- **Ajustes Personalizáveis**: Tempo por slide (6s a 60s), tipo de transição (Fade, Zoom & Fade, Slide) e visualização de widgets.

---

## 🚀 Como Ativar o GitHub Pages

Após fazer o push para o GitHub, siga estes passos para gerar o link da sua TV:

1. Acesse o seu repositório no GitHub: `https://github.com/VictorGHss/Slides-Cenovicz`
2. Vá em **Settings** (Configurações) > **Pages** (no menu lateral esquerdo).
3. Na seção **Build and deployment**:
   - Em **Source**, selecione `Deploy from a branch`.
   - Em **Branch**, selecione `main` e a pasta `/ (root)`.
   - Clique em **Save**.
4. Aguarde cerca de 1 minuto. O GitHub irá gerar o seu link público oficial:
   > 🔗 **`https://victorghss.github.io/Slides-Cenovicz/`**
5. **No navegador da Smart TV**:
   - Digite o link acima.
   - Pressione o botão de tela cheia ou aperte `F` / clique duas vezes na tela.
   - Adicione aos favoritos / tela inicial da TV para abrir rapidamente todos os dias!

---

## 🔄 Como Atualizar os Slides

Quando alterar o arquivo PowerPoint:
1. Abra o arquivo `slides cenovicz.pptx` e faça suas alterações.
2. Execute o script no PowerShell:
   ```powershell
   pwsh -File ./export_slides.ps1
   ```
3. Envie para o GitHub:
   ```bash
   git add .
   git commit -m "Atualizando slides da apresentação"
   git push
   ```
A TV será atualizada automaticamente na próxima inicialização!

---

## 📁 Estrutura de Arquivos

```
Slides-Cenovicz/
├── export_slides.ps1       # Script PowerShell que extrai todos os slides do PPTX em Full HD
├── index.html              # Aplicação principal otimizada para TV
├── manifest.json           # Manifesto PWA para atalho em tela cheia na Smart TV
├── css/
│   └── style.css           # Estilos modernos, responsivos, tema escuro e animações GPU
├── js/
│   ├── slides-data.js      # Lista indexada dos slides e durações individuais
│   └── app.js              # Lógica de reprodução, loop, transições, relógio e atalhos
└── slides/                 # Imagens 1080p extraídas dos slides (slide_01.png a slide_21.png)
```
