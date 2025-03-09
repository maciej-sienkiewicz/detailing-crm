import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';
import Layout from './components/layout/Layout';
import AppRoutes from './routes';

// Globalne style dla całej aplikacji
const GlobalStyle = createGlobalStyle`
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    body {
        font-family: 'Roboto', 'Segoe UI', 'Arial', sans-serif;
        background-color: #f8f9fa;
        color: #333;
        line-height: 1.5;
    }

    h1, h2, h3, h4, h5, h6 {
        margin-bottom: 0.5em;
        color: #2c3e50;
    }

    h1 {
        font-size: 24px;
    }

    h2 {
        font-size: 20px;
    }

    a {
        color: #3498db;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    button, input, select, textarea {
        font-family: inherit;
    }
`;

const App: React.FC = () => {
    return (
        <Router>
            <GlobalStyle />
            <Layout>
                <AppRoutes />
            </Layout>
        </Router>
    );
};

export default App;