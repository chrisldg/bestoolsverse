const express = require('express');
const cors = require('cors');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Créer une session de checkout Stripe
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, userId, customerEmail } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'https://bestoolsverse.vercel.app'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'https://bestoolsverse.vercel.app'}/pricing`,
      customer_email: customerEmail,
      metadata: {
        userId: userId
      }
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error('Erreur Stripe:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook Stripe pour gérer les événements
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Erreur webhook:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les différents types d'événements
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Mettre à jour l'utilisateur dans Firebase
      await updateUserSubscription(session);
      break;
      
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Mettre à jour le statut de l'abonnement
      await updateSubscriptionStatus(subscription);
      break;
  }

  res.json({ received: true });
});

// Fonction pour mettre à jour l'abonnement utilisateur
async function updateUserSubscription(session) {
  // TODO: Implémenter la mise à jour Firebase
  console.log('Mise à jour de l\'abonnement pour:', session.metadata.userId);
}

// Fonction pour mettre à jour le statut de l'abonnement
async function updateSubscriptionStatus(subscription) {
  // TODO: Implémenter la mise à jour du statut
  console.log('Mise à jour du statut:', subscription.id);
}

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});