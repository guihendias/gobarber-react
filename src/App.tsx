import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import AppProvider from './hooks';
import Routes from './routes';
import GlobalStyle from './styles/global';

function App() {
    return (
        <BrowserRouter>
            <AppProvider>
                <Routes />
            </AppProvider>
            <GlobalStyle />
        </BrowserRouter>
    );
}

export default App;
