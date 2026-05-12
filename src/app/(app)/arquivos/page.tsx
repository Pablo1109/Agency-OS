import { CloudUpload, FileArchive, ImageIcon, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppData } from "@/lib/data";

export default async function FilesPage() {
  const data = await getAppData();

  return (
    <>
      <PageHeader
        title="Arquivos"
        description="Estrutura para guardar logos, videos, fotos, briefing, contratos e identidade visual via Cloudinary."
      />

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Upload Cloudinary</CardTitle>
            <CardDescription>O endpoint de assinatura ja esta criado para uploads seguros.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex h-44 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/40 text-center">
              <CloudUpload className="mb-3 h-8 w-8 text-primary" />
              <p className="text-sm font-medium">Upload preparado para Cloudinary</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Configure as variaveis e conecte um widget ou formulario de envio na Fase 2.
              </p>
            </div>
            <Button variant="outline" className="w-full">
              <ShieldCheck className="h-4 w-4" />
              Usar /api/cloudinary/sign
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pastas por cliente</CardTitle>
            <CardDescription>Modelo de organizacao para os arquivos da agencia.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {data.clients.map((client) => (
              <div key={client.id} className="rounded-md border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{client.company || client.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{client.instagram || client.email}</p>
                  </div>
                  <FileArchive className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Logos", "Fotos", "Videos", "Contratos"].map((folder) => (
                    <Badge key={folder} className="border-slate-200 bg-slate-100 text-slate-600">
                      <ImageIcon className="mr-1 h-3 w-3" />
                      {folder}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
