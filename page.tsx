import { ArrowRight, CalendarClock, CheckCircle2, Clock3, Plus, Siren } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTaskAction, updateTaskStatusAction } from "@/lib/actions";
import { taskPriorityLabels, taskPriorityTone, taskStatusLabels } from "@/lib/constants";
import { getAppData } from "@/lib/data";
import { formatRelativeDay } from "@/lib/format";
import { groupTasksByStatus } from "@/lib/metrics";
import type { TaskStatus } from "@/lib/types";

const statusFlow: TaskStatus[] = ["A_FAZER", "EM_ANDAMENTO", "AGUARDANDO_CLIENTE", "FINALIZADO"];

export default async function TasksPage() {
  const data = await getAppData();
  const grouped = groupTasksByStatus(data.tasks);
  const openTasks = data.tasks.filter((task) => task.status !== "FINALIZADO");
  const urgentTasks = openTasks.filter((task) => task.priority === "ALTA" || task.priority === "URGENTE");

  return (
    <>
      <PageHeader
        title="Tarefas"
        description="Kanban simples para organizar jobs, aprovacoes e entregas por cliente."
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Clock3 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Em aberto</p>
              <p className="text-xl font-semibold">{openTasks.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Siren className="h-5 w-5 text-rose-600" />
            <div>
              <p className="text-sm text-muted-foreground">Alta prioridade</p>
              <p className="text-xl font-semibold">{urgentTasks.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm text-muted-foreground">Finalizadas</p>
              <p className="text-xl font-semibold">{grouped.FINALIZADO.length}</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Nova tarefa</CardTitle>
          <CardDescription>Crie uma demanda com cliente, prioridade e prazo.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createTaskAction} className="grid gap-4 lg:grid-cols-[1.2fr_0.7fr_0.7fr_0.7fr_auto] lg:items-end">
            <div className="grid gap-2">
              <Label htmlFor="title">Titulo</Label>
              <Input id="title" name="title" placeholder="Ex: editar reels da semana" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientId">Cliente</Label>
              <Select id="clientId" name="clientId" defaultValue="">
                <option value="">Sem cliente</option>
                {data.clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company || client.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select id="priority" name="priority" defaultValue="MEDIA">
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Prazo</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>
            <Button type="submit" className="lg:mb-0">
              <Plus className="h-4 w-4" />
              Criar
            </Button>
            <div className="grid gap-2 lg:col-span-5">
              <Label htmlFor="description">Descricao</Label>
              <Textarea id="description" name="description" placeholder="Detalhes, links, combinados e anexos" />
            </div>
          </form>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-4">
        {statusFlow.map((status) => (
          <Card key={status} className="min-h-80">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{taskStatusLabels[status]}</span>
                <Badge className="border-slate-200 bg-slate-100 text-slate-600">{grouped[status].length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {grouped[status].length === 0 ? (
                <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Nenhuma tarefa aqui.</p>
              ) : null}

              {grouped[status].map((task) => {
                const currentIndex = statusFlow.indexOf(task.status);
                const nextStatus = statusFlow[currentIndex + 1];

                return (
                  <div key={task.id} className="rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold leading-5">{task.title}</p>
                      <Badge className={taskPriorityTone[task.priority]}>{taskPriorityLabels[task.priority]}</Badge>
                    </div>
                    {task.description ? (
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{task.description}</p>
                    ) : null}
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <p>{task.clientName ?? "Sem cliente"}</p>
                      <p className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {task.dueDate ? formatRelativeDay(task.dueDate) : "Sem prazo"}
                      </p>
                    </div>
                    {nextStatus ? (
                      <form action={updateTaskStatusAction} className="mt-4">
                        <input type="hidden" name="taskId" value={task.id} />
                        <input type="hidden" name="status" value={nextStatus} />
                        <Button type="submit" variant="outline" size="sm" className="w-full">
                          <ArrowRight className="h-4 w-4" />
                          Mover
                        </Button>
                      </form>
                    ) : null}
                    <form action={updateTaskStatusAction} className="mt-2">
                      <input type="hidden" name="taskId" value={task.id} />
                      <Select name="status" defaultValue={task.status} className="h-9 text-xs">
                        {statusFlow.map((option) => (
                          <option key={option} value={option}>
                            {taskStatusLabels[option]}
                          </option>
                        ))}
                      </Select>
                      <Button type="submit" variant="ghost" size="sm" className="mt-2 w-full">
                        Atualizar status
                      </Button>
                    </form>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </section>
    </>
  );
}
