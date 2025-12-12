// Test simple pour PRO
module.exports = async function (context, req) {
    context.log('TEST PRO');
    
    if (req.method === 'OPTIONS') {
        context.res = {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
        return;
    }

    try {
        context.res = {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: {
                response: "Test PRO OK",
                responseTime: "0ms",
                proPlan: true,
                model: 'test',
                provider: 'test'
            }
        };
    } catch (error) {
        context.res = {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: {
                error: error.message
            }
        };
    }
};
