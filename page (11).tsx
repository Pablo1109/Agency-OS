import { Building2, CircleDollarSign, Mail, Phone, Plus, UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createClientAction } from "@/lib/actions";
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
                  <Label htmlFor="dueDay">Vencimento</Label>
                  <Input id="dueDay" name="dueDay" type="number" min="1" max="31" placeholder="10" />
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
                      Plano {client.plan || "sem nome"} | vence dia {client.dueDay}
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
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
