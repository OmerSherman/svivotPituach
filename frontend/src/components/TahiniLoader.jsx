import React from 'react';
import './TahiniLoader.css';

function TahiniLoader() {
    return (
        <div className="tahini-loader-container">
            <div className="tahini-jar">
                <div className="jar-lid"></div>
                <div className="jar-body">
                    <div className="tahini-label">טחינה</div>
                    <div className="tahini-fill"></div>
                </div>
            </div>
            <p className="loading-text">מערבב טחינה...</p>
        </div>
    );
}

export default TahiniLoader;