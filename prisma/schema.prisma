generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum ClientStatus {
  ATIVO
  PROSPECT
  PAUSADO
  INADIMPLENTE
  ENCERRADO
}

enum TaskStatus {
  A_FAZER
  EM_ANDAMENTO
  AGUARDANDO_CLIENTE
  FINALIZADO
}

enum TaskPriority {
  BAIXA
  MEDIA
  ALTA
  URGENTE
}

enum FinanceType {
  RECEITA
  DESPESA
}

enum LeadStatus {
  LEAD_NOVO
  CONTATO_FEITO
  PROPOSTA_ENVIADA
  NEGOCIACAO
  FECHADO
  PERDIDO
}

enum ContentStatus {
  IDEIA
  PRODUCAO
  APROVACAO
  AGENDADO
  PUBLICADO
}

model User {
  id            String    @id
  name          String
  email         String
  emailVerified Boolean
  image         String?
  createdAt     DateTime
  updatedAt     DateTime
  sessions      Session[]
  accounts      Account[]

  @@unique([email])
  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String
  createdAt DateTime
  updatedAt DateTime
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime
  updatedAt             DateTime

  @@map("account")
}

model Verification {
  id         String    @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime?
  updatedAt  DateTime?

  @@map("verification")
}

model Client {
  id           String              @id @default(cuid())
  name         String
  company      String?
  phone        String?
  instagram    String?
  email        String?
  niche        String?
  plan         String?
  monthlyValue Decimal             @default(0) @db.Decimal(12, 2)
  dueDay       Int?
  notes        String?
  status       ClientStatus        @default(PROSPECT)
  createdAt    DateTime            @default(now())
  updatedAt    DateTime            @updatedAt
  services     ContractedService[]
  tasks        Task[]
  finances     FinancialEntry[]
  contentItems ContentItem[]
  files        FileAsset[]

  @@map("clients")
}

model ContractedService {
  id              String   @id @default(cuid())
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  name            String
  quantity        Int?
  unit            String?
  monthlyIncluded Boolean  @default(true)
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("contracted_services")
}

model Task {
  id          String       @id @default(cuid())
  title       String
  description String?
  clientId    String?
  client      Client?      @relation(fields: [clientId], references: [id], onDelete: SetNull)
  priority    TaskPriority @default(MEDIA)
  dueDate     DateTime?
  status      TaskStatus   @default(A_FAZER)
  attachments String[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@map("tasks")
}

model FinancialEntry {
  id            String      @id @default(cuid())
  type          FinanceType
  description   String
  category      String
  amount        Decimal     @db.Decimal(12, 2)
  date          DateTime    @default(now())
  dueDate       DateTime?
  paymentMethod String?
  paid          Boolean     @default(false)
  recurring     Boolean     @default(false)
  installment   Boolean     @default(false)
  installments  Int?
  currentPart   Int?
  clientId      String?
  client        Client?     @relation(fields: [clientId], references: [id], onDelete: SetNull)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@map("financial_entries")
}

model ContentItem {
  id          String        @id @default(cuid())
  clientId    String
  client      Client        @relation(fields: [clientId], references: [id], onDelete: Cascade)
  publishDate DateTime
  theme       String
  caption     String?
  approved    Boolean       @default(false)
  published   Boolean       @default(false)
  status      ContentStatus @default(IDEIA)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@map("content_items")
}

model Lead {
  id              String     @id @default(cuid())
  name            String
  company         String?
  phone           String?
  desiredService  String?
  estimatedBudget Decimal?   @db.Decimal(12, 2)
  status          LeadStatus @default(LEAD_NOVO)
  notes           String?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  @@map("leads")
}

model FileAsset {
  id            String   @id @default(cuid())
  clientId      String?
  client        Client?  @relation(fields: [clientId], references: [id], onDelete: SetNull)
  name          String
  kind          String
  cloudinaryId  String
  url           String
  size          Int?
  format        String?
  createdAt     DateTime @default(now())

  @@map("file_assets")
}
