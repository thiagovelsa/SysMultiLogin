# Regras de Comportamento e Geração de Código

## Descrição
Estas regras guiam a IA para ser mais eficaz, proativa e consistente, resultando em um desenvolvimento mais ágil e com menos erros. As regras são divididas em seções para clareza.

---

### 1. Ambiente e Comandos de Terminal (Windows CMD)

**Prioridade Máxima:** Garantir compatibilidade total com o CMD do Windows.

1.  **NUNCA** use comandos do PowerShell. Apenas comandos do CMD (batch).
2.  Utilize sintaxe padrão do CMD: `dir`, `type`, `copy`, `move`, `del`, `mkdir`, etc.
3.  Para gerenciamento de pacotes, use `npm`, `yarn`, etc., com sua sintaxe compatível com CMD.
4.  **EVITE** comandos que comecem com `ps`, `pwsh` ou que contenham sintaxe do PowerShell (`$_`, `-ErrorAction`).
5.  Use variáveis de ambiente do Windows com a sintaxe `%VARIAVEL%`.
6.  Use caminhos de arquivo no estilo Windows com barras invertidas (`C:\\caminho\\para\\arquivo`).
7.  Para encadear comandos, use `&` ou `&&`.
8.  Para condicionais e loops, use a sintaxe do `if` e `for` do CMD.
9.  Use `findstr` para pesquisar texto em arquivos.
10. Use `>` e `>>` para redirecionamento de saída.
11. Para operações complexas (ex: manipulação de JSON), recomende o uso de scripts Node.js ou outras ferramentas de linha de comando compatíveis.

---

### 2. Análise de Contexto e Consistência

**Objetivo:** Manter a consistência e aproveitar o código existente.

1.  **Análise Prévia:** Antes de escrever qualquer código, analise a estrutura do projeto, o estilo de codificação, as bibliotecas e os padrões existentes.
2.  **Consistência Acima de Tudo:** O novo código deve ser idiomático e seguir os padrões do projeto. Se o projeto usa `axios` para chamadas de API, não introduza `fetch` sem um bom motivo.
3.  **Gerenciamento de Dependências:** Ao adicionar uma nova dependência, sempre verifique o `package.json` (ou equivalente), adicione o pacote e, em seguida, execute o comando de instalação (`npm install` ou `yarn`).

---

### 3. Geração de Código e Qualidade

**Objetivo:** Produzir código de alta qualidade, completo e funcional.

1.  **Código Completo e Funcional:** Gere código que possa ser executado imediatamente. Isso inclui todas as importações necessárias, tratamento de erros e conformidade com a arquitetura do projeto.
2.  **Comentários Inteligentes:** Adicione comentários apenas para lógica complexa, decisões de arquitetura ou partes não óbvias do código. Evite comentários que apenas descrevem o que o código já diz.
3.  **UI/UX Moderno:** Ao criar componentes de interface, garanta que sejam responsivos, acessíveis e sigam as melhores práticas de UX/UI.
4.  **Segurança em Primeiro Lugar:** Nunca exponha chaves de API, segredos ou informações sensíveis no código. Utilize variáveis de ambiente (`process.env`).

---

### 4. Proatividade e Fluxo de Trabalho

**Objetivo:** Antecipar as necessidades do usuário e otimizar o fluxo de trabalho.

1.  **Antecipação de Passos:** Após realizar alterações significativas (ex: adicionar uma nova rota ou dependência), sugira os próximos passos lógicos, como iniciar o servidor de desenvolvimento, executar testes ou o linter.
2.  **Busca por Clareza:** Se uma solicitação do usuário for ambígua ou incompleta, peça esclarecimentos antes de prosseguir. É melhor perguntar do que gerar uma solução incorreta.
3.  **Operações Atômicas:** Ao criar uma nova funcionalidade, tente agrupar a criação de todos os arquivos relacionados (componente, folha de estilo, testes) em uma única etapa lógica, se possível.
4.  **Verificação Pós-Alteração:** Após aplicar modificações, especialmente as que afetam a UI, utilize a ferramenta `open_preview` para verificar visualmente o resultado antes de concluir a tarefa.

---

### 5. Tratamento de Erros e Depuração

**Objetivo:** Diagnosticar e resolver problemas de forma eficiente.

1.  **Análise de Erros:** Quando um comando ou processo falhar, analise a mensagem de erro cuidadosamente. Não tente novamente o mesmo comando sem antes propor uma solução ou uma abordagem diferente.
2.  **Depuração Eficaz:** Para depurar, prefira adicionar logs descritivos (`console.log`) para rastrear o fluxo de execução e o estado das variáveis, em vez de fazer alterações aleatórias.
3.  **Isolamento do Problema:** Ao investigar um bug, tente isolar o problema criando um caso de teste mínimo ou uma página de teste que reproduza o erro de forma consistente.
4.  **Ciclo de Depuração Sistemático:** Ao encontrar um erro persistente, siga um ciclo: Hipótese -> Alteração -> Teste. Se a hipótese falhar, não tente variações da mesma alteração. Formule uma nova hipótese (ex: o problema não é a configuração, mas o cache).

---

### 6. Depuração de Build e Dependências

**Objetivo:** Resolver problemas complexos de compilação e gerenciamento de pacotes, comuns em ambientes como Electron.

1.  **Erro de Validação de Configuração (Schema Validation):**
    -   **Fonte da Verdade:** Sempre consulte a documentação oficial da ferramenta (ex: `electron-builder`) para a estrutura de configuração correta.
    -   **Localização do Erro:** Preste atenção ao caminho do arquivo de configuração no log de erro. As configurações podem estar em `package.json` ou em arquivos dedicados (`electron-builder.json`, etc.).
    -   **Mova, não Duplique:** Se uma propriedade como `author` for esperada no `package.json`, mova-a do arquivo de configuração do builder em vez de duplicá-la.

2.  **Erro de Dependência Nativa (ex: `sharp`, `node-gyp`):**
    -   **Causa Comum:** Geralmente causado por pacotes pré-compilados para a arquitetura/SO errada.
    -   **Passo 1: Reinstalação Limpa:** Execute a seguinte sequência de comandos **exatamente nesta ordem**:
        1. `del package-lock.json` (ou `yarn.lock`)
        2. `rmdir /s /q node_modules`
        3. `npm cache clean --force`
        4. `npm install`
    -   **Passo 2: Verificação de Scripts:** Verifique os scripts em `package.json`. Às vezes, `electron-builder install-app-deps` ou `electron-rebuild` são necessários.
    -   **Passo 3: Pesquisa Direcionada:** Se o erro persistir, pesquise o nome do pacote junto com `electron-builder` e o erro específico (ex: "electron-builder sharp ENOENT windows").

3.  **Erro de Permissão ou Caminho de Arquivo (`ENOENT`):**
    -   **Verifique o Caminho:** Confirme se o arquivo ou diretório mencionado no erro realmente existe no caminho especificado.
    -   **Contexto de Execução:** Lembre-se que os scripts são executados a partir da raiz do projeto. Caminhos relativos devem partir de lá.
    -   **Arquivos fora do Workspace:** Se precisar acessar um arquivo fora do diretório de trabalho, primeiro copie-o para dentro do projeto para evitar problemas de permissão.