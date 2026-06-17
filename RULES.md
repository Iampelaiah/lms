# Application Execution Rules

- **Node.js Environment Path**: The application must be run using the Node.js executable located at `C:\Users\msfocb-mbare-labtech\Documents\node-v24.16.0-win-x64`.

To run the application manually in Powershell, prepend the Node.js directory to your PATH:
```powershell
$env:PATH = "C:\Users\msfocb-mbare-labtech\Documents\node-v24.16.0-win-x64;" + $env:PATH
npm run dev
```
- **Git Execution Path**: For git pull, fetch, and push, use the hardcoded path `"C:\Users\msfocb-mbare-labtech\AppData\Local\Programs\Git\cmd\git.exe"` (or `"C:\Users\msfocb-mbare-labtech\AppData\Local\Programs\Git\bin\git.exe"`).
