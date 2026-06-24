export const APP_LOCALES = ["it", "en", "fr"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const DEFAULT_APP_LOCALE: AppLocale = "it";
export const APP_LOCALE_COOKIE = "enrollmate_locale";
export const LEGACY_APP_LOCALE_COOKIE = "courseadvisor_locale";

export const APP_LOCALE_LABELS: Record<AppLocale, string> = {
  it: "Italiano",
  en: "English",
  fr: "Français",
};

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && APP_LOCALES.includes(value as AppLocale);
}

export function resolveAppLocale(value: unknown): AppLocale {
  return isAppLocale(value) ? value : DEFAULT_APP_LOCALE;
}

type Translation = Record<AppLocale, string>;

export const APP_UI = {
  language: { it: "Lingua", en: "Language", fr: "Langue" },
  theme: { it: "Cambia tema", en: "Toggle theme", fr: "Changer de thème" },
  dashboard: { it: "Pannello", en: "Dashboard", fr: "Tableau de bord" },
  organization: { it: "Organizzazione", en: "Organization", fr: "Organisation" },
  signedIn: { it: "Accesso effettuato", en: "Signed in", fr: "Connecté" },
  expandSidebar: { it: "Espandi barra laterale", en: "Expand sidebar", fr: "Développer la barre latérale" },
  collapseSidebar: { it: "Comprimi barra laterale", en: "Collapse sidebar", fr: "Réduire la barre latérale" },
  dashboardNavigation: { it: "Navigazione pannello", en: "Dashboard navigation", fr: "Navigation du tableau de bord" },
  platformAdmin: { it: "Amministrazione piattaforma", en: "Platform admin", fr: "Administration de la plateforme" },
  navOverview: { it: "Panoramica", en: "Overview", fr: "Vue d’ensemble" },
  navCourses: { it: "Corsi", en: "Courses", fr: "Cours" },
  navLeads: { it: "Contatti", en: "Leads", fr: "Prospects" },
  navConversations: { it: "Conversazioni", en: "Conversations", fr: "Conversations" },
  navAnalytics: { it: "Analisi", en: "Analytics", fr: "Analyses" },
  navMembers: { it: "Membri", en: "Members", fr: "Membres" },
  navApiKeys: { it: "Chiavi API", en: "API keys", fr: "Clés API" },
  navIntegrations: { it: "Integrazioni", en: "Integrations", fr: "Intégrations" },
  navEvaluations: { it: "Valutazioni IA", en: "AI evaluations", fr: "Évaluations IA" },
  navBilling: { it: "Fatturazione", en: "Billing", fr: "Facturation" },
  navSettings: { it: "Impostazioni", en: "Settings", fr: "Paramètres" },
  navProfile: { it: "Profilo", en: "Profile", fr: "Profil" },
  authWelcome: { it: "Bentornato", en: "Welcome back", fr: "Bon retour" },
  authSubtitle: { it: "Accedi al tuo pannello", en: "Sign in to your dashboard", fr: "Connectez-vous à votre tableau de bord" },
  authRegisterTitle: { it: "Crea il tuo account", en: "Create your account", fr: "Creez votre compte" },
  authRegisterSubtitle: { it: "Inizia una prova gratuita di 14 giorni per la tua scuola.", en: "Start a 14-day free trial for your school.", fr: "Commencez un essai gratuit de 14 jours pour votre ecole." },
  authFullName: { it: "Nome completo", en: "Full name", fr: "Nom complet" },
  authConfirmPassword: { it: "Conferma password", en: "Confirm password", fr: "Confirmer le mot de passe" },
  authCreateAccount: { it: "Crea account", en: "Create account", fr: "Creer le compte" },
  authCreatingAccount: { it: "Creazione account...", en: "Creating account...", fr: "Creation du compte..." },
  authHaveAccount: { it: "Hai gia un account?", en: "Already have an account?", fr: "Vous avez deja un compte ?" },
  authNoAccount: { it: "Non hai un account?", en: "No account yet?", fr: "Pas encore de compte ?" },
  authRegisterLink: { it: "Registrati", en: "Sign up", fr: "S'inscrire" },
  authPrivacyAccept: { it: "Accetto l'informativa privacy della piattaforma e capisco che questo account avvia una prova di 14 giorni per la mia organizzazione.", en: "I accept the platform privacy notice and understand this account starts a 14-day trial for my organization.", fr: "J'accepte la notice de confidentialite de la plateforme et je comprends que ce compte lance un essai de 14 jours pour mon organisation." },
  authPrivacyLink: { it: "Privacy", en: "Privacy", fr: "Confidentialite" },
  authSignupUnavailable: { it: "La registrazione self-service non e disponibile in questa installazione. Contatta il team per avviare un progetto pilota gestito.", en: "Self-service signup is not available on this deployment. Contact the team to start a managed pilot.", fr: "L'inscription self-service n'est pas disponible sur ce deploiement. Contactez l'equipe pour lancer un projet pilote gere." },
  authBookDemo: { it: "Prenota una demo", en: "Book a demo", fr: "Reserver une demo" },
  authConfirmEmail: { it: "Account creato. Controlla la tua email per confermare l'indirizzo, poi accedi.", en: "Account created. Check your inbox to confirm your email, then sign in.", fr: "Compte cree. Consultez votre email pour confirmer votre adresse, puis connectez-vous." },
  authConfirmEmailToastTitle: { it: "Conferma la tua email", en: "Confirm your email", fr: "Confirmez votre email" },
  authDismissNotification: { it: "Chiudi notifica", en: "Dismiss notification", fr: "Fermer la notification" },
  authPassword: { it: "Password", en: "Password", fr: "Mot de passe" },
  authNewPassword: { it: "Nuova password", en: "New password", fr: "Nouveau mot de passe" },
  authCaptchaFailed: { it: "Controllo di sicurezza non riuscito. Ricarica la pagina o verifica che la chiave Turnstile sia valida per questo dominio.", en: "Security check failed. Refresh the page or verify the Turnstile site key is allowed for this domain.", fr: "Le controle de securite a echoue. Rechargez la page ou verifiez que la cle Turnstile est autorisee pour ce domaine." },
  passwordStrengthLabel: { it: "Sicurezza password", en: "Password strength", fr: "Robustesse du mot de passe" },
  passwordStrengthEmpty: { it: "Inserisci una password", en: "Enter a password", fr: "Saisissez un mot de passe" },
  passwordStrengthWeak: { it: "Debole", en: "Weak", fr: "Faible" },
  passwordStrengthGood: { it: "Buona", en: "Good", fr: "Bonne" },
  passwordStrengthStrong: { it: "Forte", en: "Strong", fr: "Forte" },
  passwordRuleLength: { it: "Almeno 8 caratteri", en: "At least 8 characters", fr: "Au moins 8 caracteres" },
  passwordRuleLowercase: { it: "Una lettera minuscola", en: "One lowercase letter", fr: "Une lettre minuscule" },
  passwordRuleUppercase: { it: "Una lettera maiuscola", en: "One uppercase letter", fr: "Une lettre majuscule" },
  passwordRuleNumber: { it: "Un numero", en: "One number", fr: "Un chiffre" },
  passwordRuleSpecial: { it: "Un carattere speciale", en: "One special character", fr: "Un caractere special" },
  passwordRuleNoSpaces: { it: "Nessuno spazio", en: "No spaces", fr: "Aucun espace" },
  passwordRuleLong: { it: "Consigliato: almeno 12 caratteri", en: "Recommended: at least 12 characters", fr: "Recommande : au moins 12 caracteres" },
  authCurrentPassword: { it: "Password attuale", en: "Current password", fr: "Mot de passe actuel" },
  profileBack: { it: "Torna al pannello", en: "Back to dashboard", fr: "Retour au tableau de bord" },
  profileEyebrow: { it: "Profilo utente", en: "User profile", fr: "Profil utilisateur" },
  profileTitle: { it: "Gestisci il tuo account", en: "Manage your account", fr: "Gerer votre compte" },
  profileBody: { it: "Aggiorna le informazioni personali collegate al tuo account dashboard.", en: "Update the personal information attached to your dashboard account.", fr: "Mettez a jour les informations personnelles liees a votre compte tableau de bord." },
  profileEmail: { it: "Email", en: "Email", fr: "Email" },
  profileOrganization: { it: "Organizzazione", en: "Organization", fr: "Organisation" },
  profileRole: { it: "Ruolo", en: "Role", fr: "Role" },
  profileNoOrganization: { it: "Non ancora creata", en: "Not created yet", fr: "Pas encore creee" },
  profilePendingOnboarding: { it: "Onboarding in attesa", en: "Pending onboarding", fr: "Onboarding en attente" },
  profilePreferredLanguage: { it: "Lingua preferita", en: "Preferred language", fr: "Langue preferee" },
  profileSave: { it: "Salva profilo", en: "Save profile", fr: "Enregistrer le profil" },
  profileSaving: { it: "Salvataggio...", en: "Saving...", fr: "Enregistrement..." },
  profileUpdated: { it: "Profilo aggiornato.", en: "Profile updated.", fr: "Profil mis a jour." },
  profileSecurityTitle: { it: "Sicurezza account", en: "Account security", fr: "Securite du compte" },
  profileSecurityBody: { it: "Modifica email o password. Per cambiare password devi inserire anche quella attuale; Supabase potrebbe inviare un'email di conferma per completare la modifica dell'indirizzo.", en: "Change your email or password. Password changes require your current password; Supabase may send a confirmation email to complete the address change.", fr: "Modifiez votre email ou votre mot de passe. Le changement de mot de passe demande le mot de passe actuel; Supabase peut envoyer un email de confirmation pour finaliser le changement d'adresse." },
  profileNewEmail: { it: "Nuova email", en: "New email", fr: "Nouvelle email" },
  profileUpdateEmail: { it: "Aggiorna email", en: "Update email", fr: "Mettre a jour l'email" },
  profileUpdatingEmail: { it: "Aggiornamento email...", en: "Updating email...", fr: "Mise a jour de l'email..." },
  profileEmailUnchanged: { it: "Questa email e gia collegata al tuo account.", en: "This email is already connected to your account.", fr: "Cette email est deja liee a votre compte." },
  profileEmailUpdated: { it: "Controlla la tua email per confermare il cambio indirizzo.", en: "Check your email to confirm the address change.", fr: "Consultez votre email pour confirmer le changement d'adresse." },
  profileUpdatePassword: { it: "Aggiorna password", en: "Update password", fr: "Mettre a jour le mot de passe" },
  profileUpdatingPassword: { it: "Aggiornamento password...", en: "Updating password...", fr: "Mise a jour du mot de passe..." },
  profilePasswordUpdated: { it: "Password aggiornata.", en: "Password updated.", fr: "Mot de passe mis a jour." },
  authMagicLink: { it: "Link magico", en: "Magic link", fr: "Lien magique" },
  authShowPassword: { it: "Mostra password", en: "Show password", fr: "Afficher le mot de passe" },
  authHidePassword: { it: "Nascondi password", en: "Hide password", fr: "Masquer le mot de passe" },
  authSignIn: { it: "Accedi", en: "Sign in", fr: "Se connecter" },
  authSigningIn: { it: "Accesso in corso…", en: "Signing in…", fr: "Connexion…" },
  authSendLink: { it: "Invia link magico", en: "Send magic link", fr: "Envoyer le lien magique" },
  authSending: { it: "Invio in corso…", en: "Sending…", fr: "Envoi…" },
  authLinkHelp: { it: "Ti invieremo via email un link di accesso sicuro e monouso.", en: "We’ll email you a secure, one-time login link.", fr: "Nous vous enverrons un lien de connexion sécurisé et à usage unique." },
  authRights: { it: "Tutti i diritti riservati.", en: "All rights reserved.", fr: "Tous droits réservés." },
  onboardingTitle: { it: "Crea la tua organizzazione", en: "Create your organization", fr: "Créez votre organisation" },
  onboardingSubtitle: { it: "Qui vivranno i tuoi corsi e il tuo assistente IA. Potrai modificare i dettagli in seguito.", en: "This is where your courses and AI assistant will live. You can change details later.", fr: "Vos cours et votre assistant IA seront réunis ici. Vous pourrez modifier les détails plus tard." },
  onboardingSignedInAs: { it: "Accesso effettuato come", en: "Signed in as", fr: "Connecté en tant que" },
  onboardingOrgName: { it: "Nome dell’organizzazione", en: "Organization name", fr: "Nom de l’organisation" },
  onboardingPublicUrl: { it: "URL pubblico", en: "Public URL", fr: "URL publique" },
  onboardingUrlHelp: { it: "Qui i tuoi studenti accederanno alla chat IA:", en: "This is where your students will access the AI chat:", fr: "Vos étudiants accéderont ici au chat IA :" },
  onboardingYourSlug: { it: "il-tuo-slug", en: "your-slug", fr: "votre-slug" },
  onboardingCreate: { it: "Crea organizzazione →", en: "Create organization →", fr: "Créer l’organisation →" },
  onboardingCreating: { it: "Creazione dell’organizzazione…", en: "Creating your organization…", fr: "Création de l’organisation…" },
  breadcrumb: { it: "Percorso di navigazione", en: "Breadcrumb", fr: "Fil d’Ariane" },
} satisfies Record<string, Translation>;

export type AppTranslationKey = keyof typeof APP_UI;

export function appText(locale: AppLocale, key: AppTranslationKey): string {
  return APP_UI[key][locale];
}
