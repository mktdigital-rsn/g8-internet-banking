"use client";

import { useRef, useState, type FormEvent } from "react";
import { ChevronLeft } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = { initialEmail: string; onBack: () => void; onComplete: (email: string) => void };

export default function PasswordRecovery({ initialEmail, onBack, onComplete }: Props) {
  const [stage, setStage] = useState<"email" | "reset" | "done">("email");
  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const normalizedEmail = email.trim().toLowerCase();
  const fieldClass = "h-11 bg-white/[0.04] border-white/15 text-white rounded-[2px]";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    setError("");
    if (stage === "reset" && (!/^\d{6}$/.test(password) || password !== confirmation)) {
      setError("Use uma senha de 6 dígitos e repita a mesma senha na confirmação.");
      return;
    }
    pending.current = true;
    setBusy(true);
    try {
      if (stage === "email") {
        await api.post("/api/auth/solicitar-reset-senha", { email: normalizedEmail });
        setStage("reset");
      } else {
        await api.post("/api/auth/resetar-senha", { email: normalizedEmail, token: token.trim(), novaSenha: password });
        setPassword("");
        setConfirmation("");
        setToken("");
        setStage("done");
      }
    } catch {
      setError(stage === "email"
        ? "Não foi possível enviar o código. Confira o e-mail cadastrado e tente novamente."
        : "Não foi possível alterar a senha. Confira o código recebido; se ele expirou, solicite outro.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="space-y-4" aria-label="Recuperação de senha">
      <div className="flex items-center gap-3">
        {stage !== "done" && <button type="button" onClick={onBack} disabled={busy} aria-label="Voltar para o login" className="p-2 text-white/60 hover:text-white disabled:opacity-50"><ChevronLeft className="h-5 w-5" /></button>}
        <h2 className="text-2xl font-black text-white">{stage === "done" ? "Senha alterada" : "Recuperar senha"}</h2>
      </div>
      {stage === "done" ? (
        <>
          <p role="status" className="text-sm text-white/60">Senha alterada com sucesso. Volte ao login para acessar com a nova senha.</p>
          <Button onClick={() => onComplete(normalizedEmail)} className="w-full h-12 bg-brand-accent text-white">VOLTAR AO LOGIN</Button>
        </>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-white/60 break-words">{stage === "email" ? "Informe o e-mail cadastrado na sua conta para receber o código de recuperação." : `Digite o código enviado para ${normalizedEmail} e escolha uma senha de 6 dígitos.`}</p>
          <fieldset disabled={busy} className="space-y-3 disabled:opacity-60">
            {stage === "email" ? (
              <div className="space-y-1">
                <label htmlFor="recovery-email" className="text-xs font-bold text-white/70">E-mail cadastrado</label>
                <Input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className={fieldClass} />
              </div>
            ) : (
              <>
                <div className="space-y-1">
                  <label htmlFor="recovery-code" className="text-xs font-bold text-white/70">Código recebido</label>
                  <Input id="recovery-code" autoComplete="one-time-code" required value={token} onChange={e => setToken(e.target.value)} className={fieldClass} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="recovery-password" className="text-xs font-bold text-white/70">Nova senha (6 dígitos)</label>
                  <Input id="recovery-password" type="password" inputMode="numeric" autoComplete="new-password" pattern="[0-9]{6}" minLength={6} maxLength={6} required value={password} onChange={e => setPassword(e.target.value.replace(/\D/g, ""))} className={fieldClass} />
                </div>
                <div className="space-y-1">
                  <label htmlFor="recovery-confirm" className="text-xs font-bold text-white/70">Confirmar nova senha</label>
                  <Input id="recovery-confirm" type="password" inputMode="numeric" autoComplete="new-password" pattern="[0-9]{6}" minLength={6} maxLength={6} required value={confirmation} onChange={e => setConfirmation(e.target.value.replace(/\D/g, ""))} className={fieldClass} />
                </div>
              </>
            )}
          </fieldset>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          <Button type="submit" disabled={busy || (stage === "reset" && !token.trim())} className="w-full h-12 bg-brand-accent hover:bg-brand-accent-hover text-white font-bold rounded-[2px]">{busy ? "AGUARDE..." : stage === "email" ? "ENVIAR CÓDIGO" : "ALTERAR SENHA"}</Button>
          {stage === "reset" && <button type="button" disabled={busy} className="text-sm text-brand-accent hover:underline disabled:opacity-50" onClick={() => { setStage("email"); setToken(""); setPassword(""); setConfirmation(""); setError(""); }}>Corrigir e-mail ou solicitar outro código</button>}
        </form>
      )}
    </section>
  );
}
