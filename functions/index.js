const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendEmergencyAlert = functions.firestore
  .document("alerts/{alertId}")
  .onCreate(async (snap, context) => {
    const alertData = snap.data();
    
    // Pega todos os usuários para encontrar os fcmTokens
    const usersSnap = await admin.firestore().collection("users").get();
    const tokens = [];
    
    usersSnap.forEach(doc => {
      const user = doc.data();
      // Envia a notificação para todos que têm token (menos para quem disparou o alerta)
      if (user.fcmToken && user.uid !== alertData.userId) {
        tokens.push(user.fcmToken);
      }
    });

    if (tokens.length === 0) {
      console.log("Nenhum token FCM encontrado. Ninguém ativou as notificações ainda.");
      return null;
    }

    const typeLabels = {
      emergency: "Emergência",
      fire: "Incêndio",
      firstaid: "Socorro Médico"
    };

    const payload = {
      notification: {
        title: `🚨 ALERTA: ${typeLabels[alertData.type] || "Emergência"}`,
        body: alertData.specificLocation 
          ? `Local: ${alertData.specificLocation}. Abra o app!`
          : `Alerta disparado por ${alertData.userName}. Abra o app imediatamente!`,
      }
    };

    try {
      // Envia usando a API moderna do Firebase Admin Multi-Cast
      const response = await admin.messaging().sendEachForMulticast({
        tokens: tokens,
        notification: payload.notification
      });

      console.log(`Notificações enviadas com sucesso para ${response.successCount} aparelhos.`);
      if (response.failureCount > 0) {
        console.log(`Falha ao enviar para ${response.failureCount} aparelhos. Alguns podem ter desinstalado o PWA.`);
      }
    } catch (error) {
      console.error("Erro CRÍTICO ao enviar Notificações Push:", error);
    }
    
    return null;
  });
