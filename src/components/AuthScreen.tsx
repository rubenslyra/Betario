import { useState } from "react";
import { useLab } from "@/lib/lab-store";
import {
  Beaker,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  KeyRound,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

type AuthMode = "login" | "register" | "recover" | "recover-done";

export function AuthScreen({ onDone }: { onDone?: () => void }) {
  const login = useLab((s) => s.login);
  const register = useLab((s) => s.register);
  const resetPassword = useLab((s) => s.resetPassword);

  const [mode, setMode] = useState<AuthMode>("login");
  const [loginField, setLoginField] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [regUser, setRegUser] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPwd, setRegPwd] = useState("");
  const [recoverField, setRecoverField] = useState("");
  const [error, setError] = useState("");
  const [newPwd, setNewPwd] = useState("");

  const reset = () => {
    setError("");
    setNewPwd("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!loginField || !password) {
      setError("Preencha todos os campos.");
      return;
    }
    const ok = login(loginField, password);
    if (ok) {
      onDone?.();
      return;
    }
    setError("Usuário/email ou senha inválidos.");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!regUser || !regEmail || !regPwd) {
      setError("Preencha todos os campos.");
      return;
    }
    if (regPwd.length < 4) {
      setError("A senha deve ter no mínimo 4 caracteres.");
      return;
    }
    const err = register(regUser, regEmail, regPwd);
    if (!err) {
      onDone?.();
      return;
    }
    if (err === "username") setError("Este nome de usuário já existe.");
    else if (err === "email") setError("Este email já está cadastrado.");
    else if (err) setError("Erro ao criar conta. Tente novamente.");
  };

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault();
    reset();
    if (!recoverField) {
      setError("Informe seu usuário ou email.");
      return;
    }
    const result = resetPassword(recoverField);
    if (!result) {
      setError("Usuário/email não encontrado.");
      return;
    }
    setNewPwd(result);
    setMode("recover-done");
  };

  const container =
    "flex min-h-dvh items-center justify-center bg-gradient-to-br from-background via-panel to-background p-4";

  const card = "glass-panel w-full max-w-sm border border-border p-8 shadow-2xl";

  const input =
    "w-full rounded-lg border border-border bg-panel-soft px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition";

  const label = "block text-xs font-medium text-muted-foreground mb-1";

  const btn =
    "w-full rounded-lg py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className={container}>
      <div className={card}>
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
            <Beaker className="h-6 w-6 text-background" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold">
            BET-<span className="gold-text">RAY</span> Lab
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Laboratório Educacional de Probabilidade
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-danger/15 p-3 text-xs font-medium text-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={label} htmlFor="auth-login">
                Usuário ou email
              </label>
              <input
                id="auth-login"
                className={input}
                placeholder="joao.silva ou joao@email.com"
                value={loginField}
                onChange={(e) => setLoginField(e.target.value)}
                autoFocus
                autoComplete="username"
              />
            </div>
            <div>
              <label className={label} htmlFor="auth-pwd">
                Senha
              </label>
              <div className="relative">
                <input
                  id="auth-pwd"
                  type={showPwd ? "text" : "password"}
                  className={input}
                  placeholder="123456"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className={`${btn} bg-primary text-background hover:opacity-90`}>
              <LogIn className="mr-2 inline h-4 w-4" />
              Entrar
            </button>
            <div className="flex justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setMode("register");
                }}
                className="text-primary hover:underline"
              >
                Criar conta
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setMode("recover");
                }}
                className="text-muted-foreground hover:underline"
              >
                Esqueci a senha
              </button>
            </div>
          </form>
        )}

        {mode === "register" && (
          <form onSubmit={handleRegister} className="space-y-4">
            <button
              type="button"
              onClick={() => {
                reset();
                setMode("login");
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" /> Voltar
            </button>
            <div>
              <label className={label} htmlFor="reg-user">
                Usuário
              </label>
              <input
                id="reg-user"
                className={input}
                placeholder="meu.usuario"
                value={regUser}
                onChange={(e) => setRegUser(e.target.value)}
                autoFocus
                autoComplete="username"
              />
            </div>
            <div>
              <label className={label} htmlFor="reg-email">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                className={input}
                placeholder="meu@email.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className={label} htmlFor="reg-pwd">
                Senha
              </label>
              <div className="relative">
                <input
                  id="reg-pwd"
                  type={showPwd ? "text" : "password"}
                  className={input}
                  placeholder="mín. 4 caracteres"
                  value={regPwd}
                  onChange={(e) => setRegPwd(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" className={`${btn} bg-primary text-background hover:opacity-90`}>
              <UserPlus className="mr-2 inline h-4 w-4" />
              Criar conta
            </button>
          </form>
        )}

        {mode === "recover" && (
          <form onSubmit={handleRecover} className="space-y-4">
            <button
              type="button"
              onClick={() => {
                reset();
                setMode("login");
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" /> Voltar
            </button>
            <div>
              <label className={label} htmlFor="recover-field">
                Usuário ou email
              </label>
              <input
                id="recover-field"
                className={input}
                placeholder="joao.silva ou joao@email.com"
                value={recoverField}
                onChange={(e) => setRecoverField(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className={`${btn} bg-gold/20 text-gold border border-gold/30 hover:bg-gold/30`}
            >
              <KeyRound className="mr-2 inline h-4 w-4" />
              Recuperar senha
            </button>
            <p className="text-center text-[10px] text-muted-foreground">
              Uma nova senha será gerada e exibida abaixo.
            </p>
          </form>
        )}

        {mode === "recover-done" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg bg-success/15 p-3">
              <CheckCircle className="h-5 w-5 text-success shrink-0" />
              <div>
                <p className="text-xs font-semibold text-success">Senha redefinida!</p>
                <p className="mt-1 font-mono text-lg font-bold tracking-wider text-foreground">
                  {newPwd}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Anote esta senha. Use-a para fazer login.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                reset();
                setLoginField("");
                setPassword(newPwd);
                setMode("login");
              }}
              className={`${btn} bg-primary text-background hover:opacity-90`}
            >
              <LogIn className="mr-2 inline h-4 w-4" />
              Ir para o login
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-[10px] text-muted-foreground">
          Ambiente educacional · Nenhum dado real é coletado
        </p>
      </div>
    </div>
  );
}
