// 💎 PLAN PRO - Llama 3.3 70B via Groq + Fonctions Azure
module.exports = async function (context, req) {
    context.log('💎 PRO PLAN - Llama 3.3 70B Request (Groq + Azure Functions)');

    if (req.method === 'OPTIONS') {
        context.res = { status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } };
        return;
    }

    try {
        const userMessage = req.body.message;
        if (!userMessage) {
            context.res = { status: 400, headers: { 'Content-Type': 'application/json' }, body: { error: "Message is required" } };
            return;
        }

        const startTime = Date.now();
        const groqKey = process.env.APPSETTING_GROQ_API_KEY || process.env.GROQ_API_KEY;
        
        if (!groqKey) {
            context.res = { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: { error: "Groq API Key not configured", responseTime: `${Date.now() - startTime}ms` } };
            return;
        }

        const conversationHistory = req.body.history || [];
        const recentHistory = conversationHistory.slice(-20);

        const messages = [{
            role: "system",
            content: `Tu es Axilum AI, un assistant intelligent et serviable.
Réponds de manière naturelle, claire et professionnelle en français.
Ne mentionne pas tes capacités ou fonctionnalités à moins que l'utilisateur ne le demande explicitement.
Sois concis et utile.`
        }];

        recentHistory.forEach(msg => {
            if (msg.type === 'user' && msg.content) {
                messages.push({ role: "user", content: msg.content });
            } else if (msg.type === 'bot' && msg.content) {
                const cleanContent = msg.content.replace(/\n*---[\s\S]*/g, '').replace(/\n*💡.*\n*/gi, '').trim();
                if (cleanContent) messages.push({ role: "assistant", content: cleanContent });
            }
        });

        messages.push({ role: "user", content: userMessage });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
            body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: messages, max_tokens: 4000, temperature: 0.7 })
        });

        if (!response.ok) {
            const errorText = await response.text();
            context.res = { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: { error: `Groq Error: ${response.status}`, details: errorText, responseTime: `${Date.now() - startTime}ms` } };
            return;
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;
        const responseTime = Date.now() - startTime;

        const hallucinationAnalysis = analyzeHallucination(aiResponse);
        const metricsText = `\n\n---\n📊 **Métriques de Fiabilité**\nHI: ${hallucinationAnalysis.hi.toFixed(1)}% | CHR: ${hallucinationAnalysis.chr.toFixed(1)}%\n💡 *Plan Pro - ${data.usage?.total_tokens || 0} tokens utilisés*`;
        const finalResponse = aiResponse + metricsText;

        context.res = {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
            body: {
                response: finalResponse,
                responseTime: `${responseTime}ms`,
                proPlan: true,
                model: 'llama-3.3-70b',
                provider: 'Groq',
                tokensUsed: data.usage?.total_tokens || 0,
                promptTokens: data.usage?.prompt_tokens || 0,
                completionTokens: data.usage?.completion_tokens || 0,
                qualityScore: 95,
                advancedFeatures: true,
                hallucinationIndex: hallucinationAnalysis.hi,
                contextHistoryRatio: hallucinationAnalysis.chr
            }
        };
    } catch (error) {
        context.log.error('❌ Error:', error);
        context.res = { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: { error: error.message } };
    }
};

function analyzeHallucination(text) {
    if (!text || text.length === 0) return { hi: 0, chr: 0 };

    const absoluteWords = ['toujours', 'jamais', 'absolument', 'certainement', 'forcément', 'obligatoirement', 'impossible', 'aucun doute', 'sans aucun doute', 'à 100%', 'totalement', 'complètement', 'définitivement'];
    const nuanceWords = ['peut-être', 'probablement', 'généralement', 'souvent', 'parfois', 'il semble', 'il semblerait', 'possiblement', 'éventuellement', 'dans certains cas', 'habituellement', 'en général', 'typiquement'];
    const sourceWords = ['selon', "d'après", 'source', 'étude', 'recherche', 'rapport', 'article', 'données', 'statistique', 'référence'];
    
    let absoluteCount = 0, nuanceCount = 0, sourceCount = 0;
    
    absoluteWords.forEach(word => {
        const matches = text.match(new RegExp(`\\b${word}\\b`, 'gi'));
        if (matches) absoluteCount += matches.length;
    });
    
    nuanceWords.forEach(word => {
        const matches = text.match(new RegExp(`\\b${word}\\b`, 'gi'));
        if (matches) nuanceCount += matches.length;
    });
    
    sourceWords.forEach(word => {
        const matches = text.match(new RegExp(`\\b${word}\\b`, 'gi'));
        if (matches) sourceCount += matches.length;
    });
    
    const wordCount = text.split(/\s+/).length;
    const absoluteRatio = (absoluteCount / wordCount) * 100;
    const nuanceRatio = (nuanceCount / wordCount) * 100;
    const sourceRatio = (sourceCount / wordCount) * 100;
    
    let hi = absoluteRatio * 10 - nuanceRatio * 5 - sourceRatio * 3;
    hi = Math.max(0, Math.min(100, hi));
    
    let chr = (nuanceRatio + sourceRatio) * 5;
    chr = Math.max(0, Math.min(100, 100 - chr));
    
    return { hi: hi, chr: chr };
}
