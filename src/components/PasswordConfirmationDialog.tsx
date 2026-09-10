"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  onConfirm?: (password: string) => Promise<void>;
};

/** The caller must validate the password and execute the action on the server. */
export default function PasswordConfirmationDialog({ open, onClose, title, description, onConfirm }: Props) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  function close() {
    if (pending.current) return;
    setPassword("");
    setError("");
    onClose();
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!onConfirm || !password || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      await onConfirm(password);
      setPassword("");
      onClose();
    } catch {
      setPassword("");
      setError("Não foi possível confirmar a exclusão. Confira sua senha e tente novamente.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <Dialog open={open} onOpenChange={value => { if (!value) close(); }}>
      <DialogContent className="w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto rounded-xl text-neutral-900">
        <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        <DialogDescription className="text-sm text-neutral-600">{description}</DialogDescription>
        <form onSubmit={submit} className="space-y-4">
          {!onConfirm ? <p role="status" className="rounded-lg bg-neutral-100 p-3 text-sm text-neutral-600">A exclusão com confirmação de senha ainda não está disponível. Nenhum agendamento será removido.</p> : (
            <div className="space-y-2">
              <label htmlFor="action-password" className="text-sm font-medium">Confirme sua senha de acesso</label>
              <Input id="action-password" type="password" autoComplete="current-password" required disabled={busy} value={password} onChange={event => setPassword(event.target.value)} className="text-neutral-900" />
            </div>
          )}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" disabled={busy} onClick={close}>Cancelar</Button>
            <Button type="submit" disabled={!onConfirm || busy || !password} className="bg-red-600 text-white hover:bg-red-700">{busy ? "Confirmando..." : "Confirmar exclusão"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
