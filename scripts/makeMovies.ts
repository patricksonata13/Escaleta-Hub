import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCsi6yy41s8DgT88lPRtlLKQFFYrgAgMSo",
    authDomain: "escaleta-hub.firebaseapp.com",
    projectId: "escaleta-hub",
    storageBucket: "escaleta-hub.firebasestorage.app",
    messagingSenderId: "825021624145",
    appId: "1:825021624145:web:1f43b9574d041d8e206d70"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function populateDatabase() {
    try {
        // Dados de exemplo para roteiros
        const sampleScripts = {
            structure: {
                acts: [
                    {
                        number: 1,
                        title: "Apresentação",
                        scenes: [
                            {
                                number: 1,
                                location: "INT. CASA - DIA",
                                description: "Personagem principal é introduzido",
                                characters: ["JOÃO"],
                                duration: 2
                            }
                        ]
                    }
                ]
            },
            characters: [
                {
                    name: "JOÃO",
                    description: "Protagonista, 30 anos, escritor",
                    traits: ["introspectivo", "criativo"]
                }
            ]
        };

        await setDoc(doc(db, "templates", "script-structure"), sampleScripts);
        console.log("✅ Banco de dados populado com sucesso!");
    } catch (error) {
        console.error("❌ Erro ao popular banco:", error);
    }
}

populateDatabase();
