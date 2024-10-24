import { useState} from 'react';
import '@aws-amplify/ui-react/styles.css';
import Body from './components/Body';
import Header from './components/Header';
import Footer from './components/Footer';
//import { fetchData } from './utils/apiService';



const App = () => {
  // Estado para manejar la visibilidad del componente Body
  const [showBody, setShowBody] = useState(false);

  /*const App = () => {
    const [headerConfig, setHeaderConfig] = useState({
      logoUrl: '',
      text: '',
      color: '',
      location: '',
    });
  
    const [footerConfig, setFooterConfig] = useState({
      text: '',
      color: '',
      location: '',
    });*/
  


  // Documentos PDF
  const pdfDocuments = [
    { name: 'Estado de cuenta Abril 2024', url: 'https://serverless-pdf-chat-us-east-1-905418296062.s3.amazonaws.com/e8636bda-25d5-4c93-a46f-74c1d7a60944/Estado+de+cuenta+Abril+2024.pdf' },
  ];


  // Función para manejar el clic del botón
  const handleClick = () => {
    setShowBody(true);
  };

  return (
    <>
      <Header
        logoUrl="https://www.danaconnect.com/wp-content/uploads/2021/10/logo-danaconnect-header.png"
        text="My Header"
        color="#0c6069"
        location="left"
      />
      <div className="container">
        {/* Muestra el botón y los documentos PDF solo si showBody es false */}
        {!showBody && (
          <>
            <button onClick={handleClick} className="mb-4">Firmar</button>

            {pdfDocuments.map((doc, index) => (
              <div key={index} className="mb-8">
                <h3 className="text-lg font-semibold mb-2 text-gray-500">{doc.name}</h3>
                <iframe
                  src={doc.url}
                  width="100%"
                  height="600px"
                  title={`PDF Viewer ${index + 1}`}
                  className="border border-gray-300"
                />
              </div>

            ))}
          </>
        )}

        {/* Muestra Body solo si showBody es true */}
        {showBody && <Body />}
      </div>
      <Footer
      text="My Footer"
      color="#0c6069"
      location="center"
    />
    </>
  );
};

export default App;
