# BestoolsVerse Backend API

Backend Express.js avec intégration Stripe pour BestoolsVerse

## 🚀 Installation

### 1. **Cloner le repository**
```bash
git clone https://github.com/chrisldg/bestoolsverse-backend.git
cd bestoolsverse-backend
```

### 2. **Installer les dépendances**
```bash
npm install
```

### 3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos vraies clés Stripe
```

### 4. **Lancer le serveur**
```bash
npm start       # Production
npm run dev     # Développement avec nodemon
```

## 📋 API Endpoints

### Stripe Checkout
- **POST** `/api/create-checkout-session`
  - Body: `{ priceId, userId, customerEmail }`
  - Response: `{ id: sessionId }`

### Webhook Stripe
- **POST** `/api/stripe-webhook`
  - Headers: `stripe-signature`
  - Gère les événements Stripe

### Health Check
- **GET** `/health`
  - Response: `{ status: 'OK' }`

## 🔑 Configuration Stripe

1. Créez un compte sur [Stripe Dashboard](https://dashboard.stripe.com)
2. Récupérez votre clé secrète (sk_test_...)
3. Configurez le webhook endpoint
4. Copiez le webhook secret (whsec_...)

## 🚀 Déploiement

### Railway (Recommandé)
```bash
railway login
railway init
railway add
railway up
railway domain
```

**Variables d'environnement sur Railway:**
```bash
railway variables set PORT=3001
railway variables set NODE_ENV=production
railway variables set CLIENT_URL=https://bestoolsverse.com
railway variables set STRIPE_SECRET_KEY=sk_test_...
railway variables set STRIPE_WEBHOOK_SECRET=whsec_...
railway variables set RECAPTCHA_SECRET_KEY=...
railway variables set ALLOWED_ORIGINS=https://bestoolsverse.com,https://www.bestoolsverse.com
```

### Heroku
```bash
heroku create bestoolsverse-api
heroku config:set STRIPE_SECRET_KEY=sk_test_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
heroku config:set CLIENT_URL=https://bestoolsverse.com
heroku config:set NODE_ENV=production
git push heroku main
```

### Render
1. Créez un nouveau Web Service sur [Render](https://render.com)
2. Connectez votre repo GitHub
3. Configurez les variables d'environnement dans le dashboard
4. Déployez automatiquement à chaque push

## 📦 Dépendances

- **express**: ^4.18.2
- **stripe**: ^14.10.0
- **cors**: ^2.8.5
- **dotenv**: ^16.3.1
- **firebase-admin**: ^11.11.1 (optionnel)

## 🔒 Sécurité

- ✅ Ne jamais exposer les clés secrètes
- ✅ Utiliser HTTPS en production
- ✅ Valider les webhooks Stripe
- ✅ Limiter les CORS aux domaines autorisés
- ✅ Utiliser des variables d'environnement
- ✅ Implémenter rate limiting
- ✅ Logger les erreurs sans exposer les détails sensibles

## 📊 Monitoring

### Logs
```bash
# Voir les logs en production (Railway)
railway logs

# Voir les logs (Heroku)
heroku logs --tail
```

### Health Check
Configurez un monitoring sur `/health` pour vérifier que l'API est en ligne.

## 🧪 Tests

### Tests locaux avec Stripe CLI
```bash
# Installer Stripe CLI
brew install stripe/stripe-cli/stripe

# Se connecter
stripe login

# Écouter les webhooks localement
stripe listen --forward-to localhost:3001/api/stripe-webhook

# Déclencher un événement test
stripe trigger payment_intent.succeeded
```

## 📁 Structure du projet

```
bestoolsverse-backend/
├── index.js              # Serveur Express principal
├── package.json          # Dépendances et scripts
├── package-lock.json     # Lock file
├── .env                  # Variables d'environnement (NE PAS COMMIT)
├── .env.example          # Template des variables
├── .gitignore           # Fichiers à ignorer
└── README.md            # Documentation
```

## 🚨 Dépannage

### Erreur CORS
- Vérifiez que `CLIENT_URL` correspond exactement à votre domaine frontend
- Assurez-vous que `ALLOWED_ORIGINS` inclut tous vos domaines

### Webhook Stripe ne fonctionne pas
- Vérifiez que l'URL du webhook est correcte dans Stripe Dashboard
- Assurez-vous que `STRIPE_WEBHOOK_SECRET` est correct
- Testez avec Stripe CLI en local

### Erreur de connexion à Firebase
- Téléchargez la clé de service depuis Firebase Console
- Configurez les variables `FIREBASE_*` correctement

## 📞 Support

- Email: contact@bestoolsverse.com
- Documentation Stripe: https://stripe.com/docs
- Documentation Firebase: https://firebase.google.com/docs

## ⚠️ ATTENTION CRITIQUE

**NE JAMAIS committer le fichier `.env` avec les vraies clés !**

- ❌ Le `.env.example` ne doit JAMAIS contenir de vraies clés
- ✅ Utilisez des placeholders comme `sk_test_YOUR_KEY_HERE`
- ✅ Gardez le `.env` avec les vraies clés en local uniquement
- ✅ Ajoutez `.env` dans `.gitignore`

## 📄 License

MIT © 2024 BestoolsVerse