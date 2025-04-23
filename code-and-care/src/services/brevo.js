export async function enviarEmailInteressado(nome, email, mensagem) {
    // substitui pela sua API key
    const apiKey = 'Api Key';

    const payload = {
        sender: {
            //Dados do Remetente
            name: "Atex Code & Care",
            email: "atexcodecare@gmail.com"
        },
        to: [
            {
                //Dados do destinatario
                email: "atexcodecare@gmail.com",
                name: "Equipe Atex"
            }
        ],
        subject: "Interessado(a) em ajudar na campanha",
        htmlContent: `
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #444;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .email-container {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #007aff;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 25px;
            background-color: #f9f9f9;
        }
        .data-card {
            background: white;
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .data-item {
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #eee;
        }
        .data-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .label {
            font-weight: 600;
            color: #007aff;
            display: block;
            margin-bottom: 5px;
        }
        .value {
            color: #333;
        }
        .footer {
            text-align: center;
            padding: 15px;
            font-size: 14px;
            color: #777;
            background-color: #f0f0f0;
        }
        .logo {
            max-width: 150px;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Novo Interessado na Campanha</h1>
            <p>Você recebeu uma nova mensagem de contato</p>
        </div>
        
        <div class="content">
            <div class="data-card">
                <div class="data-item">
                    <span class="label">Nome</span>
                    <span class="value">${nome}</span>
                </div>
                
                <div class="data-item">
                    <span class="label">E-mail</span>
                    <span class="value">${email}</span>
                </div>
                
                <div class="data-item">
                    <span class="label">Mensagem</span>
                    <p class="value">${mensagem}</p>
                </div>
            </div>
            
            <p style="text-align: center; margin-top: 25px;">
                <a href="mailto:${email}" style="
                    background-color: #007aff;
                    color: white;
                    padding: 12px 25px;
                    text-decoration: none;
                    border-radius: 4px;
                    display: inline-block;
                ">Responder ao Contato</a>
            </p>
        </div>
        
        <div class="footer">
            <p>© ${new Date().getFullYear()} Atex Code & Care - Todos os direitos reservados</p>
            <p>Este é um e-mail automático, por favor não responda diretamente a esta mensagem</p>
        </div>
    </div>
</body>
</html>
        `
    };

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": apiKey,
                "content-type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Erro ao enviar e-mail:", data);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Erro ao enviar e-mail:", error);
        return false;
    }
}
