// src/App.tsx
// Aktualizacja globalnych stylów w aplikacji, aby zapewnić lepszą responsywność

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
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    h1, h2, h3, h4, h5, h6 {
        margin-bottom: 0.5em;
        color: #2c3e50;
    }

    h1 {
        font-size: 24px;

        @media (max-width: 768px) {
            font-size: 22px;
        }

        @media (max-width: 576px) {
            font-size: 20px;
        }
    }

    h2 {
        font-size: 20px;

        @media (max-width: 768px) {
            font-size: 18px;
        }

        @media (max-width: 576px) {
            font-size: 16px;
        }
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

    /* Dodatkowe style dla lepszej responsywności tabel */
    table {
        width: 100%;
        border-collapse: collapse;
    }

    @media (max-width: 768px) {
        .responsive-table {
            display: block;
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }
    }

    /* Style dla lepszej responsywności formularzy */
    input, select, textarea {
        max-width: 100%;
    }

    /* Poprawa widoczności przycisków na urządzeniach dotykowych */
    @media (max-width: 576px) {
        button {
            min-height: 44px; /* Zalecana minimalna wysokość dla elementów dotykowych */
        }
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