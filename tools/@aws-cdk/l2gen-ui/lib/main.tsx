import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import 'normalize.css/normalize.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/select/lib/css/blueprint-select.css';
import './main.css';
import { loadInitialAppState } from './load-suggestions';
import { AppStateProvider } from './app-state';

Neutralino.init();

function logFmt(x: unknown) {
  return typeof x === 'string' ? x : (x instanceof Error ? `Error: ${x.message}\n${(x.stack ?? '').split('\n').map(x => `  ${x}`).join('\n')}` : JSON.stringify(x));
}

const originalLog = console.log;
console.log = (...args: string[]) => {
  Neutralino.debug.log(`${args.map(logFmt).join(' ')}`);
  originalLog(...args);
}
const originalError = console.error;
console.error = (...args: string[]) => {
  Neutralino.debug.log(`${args.map(logFmt).join(' ')}`, 'ERROR');
  originalError(...args);
}

(async () => {
  try {
    const initialState = await loadInitialAppState('/Users/huijbers/Workspaces/PublicCDK/aws-cdk2/packages/@aws-cdk/aws-wafv2');
    const root = ReactDOM.createRoot(document.getElementById('root')!);
    root.render(
      <React.StrictMode>
        <AppStateProvider initialState={initialState}>
          <App />
        </AppStateProvider>
      </React.StrictMode>
    );
  } catch (e) {
    console.error(e);
  }
})();