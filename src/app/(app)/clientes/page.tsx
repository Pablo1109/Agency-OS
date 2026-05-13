import { Building2, CircleDollarSign, KeyRound, Mail, Phone, Plus, Save, UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClientAction, createClientCredentialAction, updateClientAction } from "@/lib/actions";
import { clientStatusLabels, clientStatusTone } from "@/lib/constants";
import { getAppData } from "@/lib/data";
import { formatCurrency } from "@/lib/format";

export default async function ClientsPage() {
  const data = await getAppData();

  return (
    <>
      <PageHeader
        title="Clientes"
        description="Cadastre clientes, acompanhe plano contratado, valor mensal, vencimento e entregas combinadas."
      />

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>Novo cliente</CardTitle>
            <CardDescription>Campos principais para organizar sua operacao sem virar um ERP.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createClientAction} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" placeholder="Nome do contato" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="company">Empresa</Label>
                <Input id="company" name="company" placeholder="Nome da empresa" />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" name="phone" placeholder="WhatsApp" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input id="instagram" name="instagram" placeholder="@perfil" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" placeholder="cliente@email.com" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="niche">Nicho</Label>
                  <Input id="niche" name="niche" placeholder="Ex: restaurante" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="plan">Plano</Label>
                  <Input id="plan" name="plan" placeholder="Essencial" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="monthlyValue">Valor mensal</Label>
                  <Input id="monthlyValue" name="monthlyValue" type="number" step="0.01" placeholder="1200" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDay">1o vencimento</Label>
                  <Input id="dueDay" name="dueDay" type="number" min="1" max="31" placeholder="10" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="billingFrequency">Frequencia</Label>
                  <Select id="billingFrequency" name="billingFrequency" defaultValue="MENSAL">
                    <option value="MENSAL">Mensal</option>
                    <option value="QUINZENAL">Quinzenal</option>
                    <option value="SEMANAL">Semanal</option>
                    <option value="PERSONALIZADO">Personalizado</option>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dueDays">Dias de vencimento</Label>
                  <Input id="dueDays" name="dueDays" placeholder="Ex: 5, 20 ou 7, 14, 21, 28" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue="PROSPECT">
                  <option value="ATIVO">Ativo</option>
                  <option value="PROSPECT">Prospect</option>
                  <option value="PAUSADO">Pausado</option>
                  <option value="INADIMPLENTE">Inadimplente</option>
                  <option value="ENCERRADO">Encerrado</option>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Observacoes</Label>
                <Textarea id="notes" name="notes" placeholder="Combinados, preferencias e alertas" />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="h-4 w-4" />
                Cadastrar cliente
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {data.clients.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-sm text-muted-foreground">
                Nenhum cliente cadastrado ainda. Cadastre o primeiro cliente no formulario ao lado.
              </CardContent>
            </Card>
          ) : null}

          {data.clients.map((client) => (
            <Card key={client.id}>
              <CardContent className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-normal">{client.company || client.name}</h2>
                      <Badge className={clientStatusTone[client.status]}>{clientStatusLabels[client.status]}</Badge>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      <span className="flex items-center gap-2">
                        <UserRound className="h-4 w-4" />
                        {client.name}
                      </span>
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {client.niche || "Sem nicho"}
                      </span>
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {client.phone || "Sem telefone"}
                      </span>
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {client.email || client.instagram || "Sem contato"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/40 p-4 lg:w-64">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <CircleDollarSign className="h-4 w-4 text-primary" />
                      {formatCurrency(client.monthlyValue)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Plano {client.plan || "sem nome"} | {client.billingFrequency.toLowerCase()} | vence dia(s){" "}
                      {client.dueDays || client.dueDay}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {client.services.map((service) => (
                    <div key={service.id} className="rounded-md border p-3">
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {service.quantity ? `${service.quantity} ${service.unit ?? "entregas"}` : "Escopo aberto"}
                      </p>
                      {service.notes ? <p className="mt-2 text-xs text-muted-foreground">{service.notes}</p> : null}
                    </div>
                  ))}
                </div>

                {client.notes ? <p className="mt-4 text-sm text-muted-foreground">{client.notes}</p> : null}

                <div className="mt-5 grid gap-4 rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Editar ficha</h3>
                  </div>
                  <form action={updateClientAction} className="grid gap-3">
                    <input type="hidden" name="clientId" value={client.id} />
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input name="name" defaultValue={client.name} placeholder="Nome" required />
                      <Input name="company" defaultValue={client.company} placeholder="Empresa" />
                      <Input name="phone" defaultValue={client.phone} placeholder="Telefone" />
                      <Input name="instagram" defaultValue={client.instagram} placeholder="Instagram" />
                      <Input name="email" defaultValue={client.email} type="email" placeholder="Email" />
                      <Input name="niche" defaultValue={client.niche} placeholder="Nicho" />
                      <Input name="plan" defaultValue={client.plan} placeholder="Plano" />
                      <Input name="monthlyValue" defaultValue={client.monthlyValue} type="number" step="0.01" placeholder="Valor" />
                      <Input name="dueDay" defaultValue={client.dueDay} type="number" min="1" max="31" placeholder="1o vencimento" />
                      <Input name="dueDays" defaultValue={client.dueDays} placeholder="Dias: 5, 20" />
                      <Select name="billingFrequency" defaultValue={client.billingFrequency}>
                        <option value="MENSAL">Mensal</option>
                        <option value="QUINZENAL">Quinzenal</option>
                        <option value="SEMANAL">Semanal</option>
                        <option value="PERSONALIZADO">Personalizado</option>
                      </Select>
                      <Select name="status" defaultValue={client.status}>
                        <option value="ATIVO">Ativo</option>
                        <option value="PROSPECT">Prospect</option>
                        <option value="PAUSADO">Pausado</option>
                        <option value="INADIMPLENTE">Inadimplente</option>
                        <option value="ENCERRADO">Encerrado</option>
                      </Select>
                    </div>
                    <Textarea name="notes" defaultValue={client.notes} placeholder="Observacoes" />
                    <Button type="submit" variant="outline" size="sm" className="w-fit">
                      <Save className="h-4 w-4" />
                      Salvar ficha
                    </Button>
                  </form>
                </div>

                <div className="mt-4 grid gap-4 rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Acessos do cliente</h3>
                  </div>
                  {client.credentials.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum acesso cadastrado.</p>
                  ) : null}
                  <div className="grid gap-2 md:grid-cols-2">
                    {client.credentials.map((credential) => (
                      <div key={credential.id} className="rounded-md border bg-background p-3 text-sm">
                        <p className="font-medium">{credential.platform}</p>
                        <p className="text-muted-foreground">Login: {credential.login || "nao informado"}</p>
                        <p className="text-muted-foreground">Senha: {credential.password || "nao informada"}</p>
                        {credential.notes ? <p className="mt-1 text-xs text-muted-foreground">{credential.notes}</p> : null}
                      </div>
                    ))}
                  </div>
                  <form action={createClientCredentialAction} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                    <input type="hidden" name="clientId" value={client.id} />
                    <Input name="platform" placeholder="Instagram, Meta Ads..." required />
                    <Input name="login" placeholder="Login/email" />
                    <Input name="password" placeholder="Senha" />
                    <Button type="submit" size="sm">
                      <Plus className="h-4 w-4" />
                      Add acesso
                    </Button>
                    <Textarea name="notes" placeholder="Observacoes do acesso" className="md:col-span-4" />
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
