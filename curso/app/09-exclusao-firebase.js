  // Auth transitório em memória: uma resposta atrasada de deleteUser só pode encerrar esta instância.
  // updateCurrentUser clona o User para o Auth isolado, preservando a reautenticação recente.
  async function authExclusaoIsolada(api, usuario) {
    const app = api.appSDK.initializeApp(api.auth.app.options, 'exclusao-' + opId());
    try {
      const auth = api.au.getAuth(app);
      if (FB.emuladores && /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) api.au.connectAuthEmulator(auth, FB.emuladores.auth, { disableWarnings: true });
      await api.au.setPersistence(auth, api.au.inMemoryPersistence);
      await api.au.updateCurrentUser(auth, usuario);
      return { app, auth };
    } catch (e) { await api.appSDK.deleteApp(app).catch(() => null); throw e; }
  }
