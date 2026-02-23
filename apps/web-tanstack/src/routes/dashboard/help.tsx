import { createFileRoute } from '@tanstack/react-router'
import { HelpCircleIcon, Loader2Icon } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CodeBlock } from '@/components/ui/code-block'
import {
  CardSkeleton,
  StatsCardSkeleton,
  TableSkeleton,
  FormSkeleton,
  ProfileSkeleton,
  ListItemSkeleton,
  HelpSkeleton,
} from '@/components/ui/skeletons'
import { TokenStatus } from '@/components/auth/token-status'

export const Route = createFileRoute('/dashboard/help')({
  component: HelpPage,
  pendingComponent: HelpSkeleton,
})

function HelpPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Aide</h2>
        <p className="text-muted-foreground">
          Guide d'utilisation et documentation technique
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircleIcon className="size-5" />
              Skeleton Loading
            </CardTitle>
            <CardDescription>
              Comment afficher des indicateurs de chargement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Composants disponibles</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">CardSkeleton</Badge>
                <Badge variant="secondary">StatsCardSkeleton</Badge>
                <Badge variant="secondary">TableSkeleton</Badge>
                <Badge variant="secondary">FormSkeleton</Badge>
                <Badge variant="secondary">ProfileSkeleton</Badge>
                <Badge variant="secondary">ListItemSkeleton</Badge>
                <Badge variant="secondary">DashboardSkeleton</Badge>
                <Badge variant="secondary">PageSkeleton</Badge>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">
                Exemple: Dashboard avec skeleton
              </h4>
              <CodeBlock
                code={`import { DashboardSkeleton } from '@/components/ui/skeletons'

function MyDashboard() {
  const { data, isLoading } = useQuery(...)
  
  if (isLoading) {
    return <DashboardSkeleton />
  }
  
  return <Dashboard data={data} />
}`}
                language="tsx"
              />
            </div>

            <div>
              <h4 className="font-medium mb-2">
                Exemple: Tableau avec skeleton
              </h4>
              <CodeBlock
                code={`import { TableSkeleton } from '@/components/ui/skeletons'

function UsersTable() {
  const { data, isLoading } = useQuery(...)
  
  return (
    <TableSkeleton 
      rows={5} 
      columns={4} 
    />
  )
}`}
                language="tsx"
              />
            </div>

            <div>
              <h4 className="font-medium mb-2">
                Exemple: DataTable avec loading
              </h4>
              <CodeBlock
                code={`import { DataTable } from '@/components/ui/data-table'

<DataTable
  columns={columns}
  data={data}
  loading={{ enabled: isLoading }}
/>`}
                language="tsx"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2Icon className="size-5" />
              Preview des Skeletons
            </CardTitle>
            <CardDescription>
              Aperçu en direct des composants de chargement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2 text-sm">Stats Cards</h4>
              <div className="grid grid-cols-2 gap-4">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm">Table</h4>
              <TableSkeleton rows={3} columns={3} />
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm">Form</h4>
              <FormSkeleton fields={2} />
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm">Profile</h4>
              <ProfileSkeleton />
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm">List Items</h4>
              <div className="space-y-2">
                <ListItemSkeleton />
                <ListItemSkeleton />
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2 text-sm">Card</h4>
              <CardSkeleton />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2Icon className="size-5" />
            Token d'authentification
          </CardTitle>
          <CardDescription>
            Indicateur de validité du token de session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Indicateur de session</h4>
            <p className="text-sm text-muted-foreground mb-4">
              L'indicateur ci-dessous montre le temps restant avant l'expiration
              de votre token d'authentification. Le token est automatiquement
              rafraîchi avant son expiration.
            </p>
            <div className="flex flex-wrap gap-4">
              <TokenStatus />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">États de l'indicateur</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">
                  Vert: Session active (&gt; 5 min)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm">
                  Jaune: Expiration proche (2-5 min)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm">
                  Orange: Rafraîchissement imminent (&lt; 2 min)
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">Rouge: Session expirée</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Utilisation en component</h4>
            <CodeBlock
              code={`import { TokenStatus } from '@/components/auth/token-status'

// Version complète
<TokenStatus />

// Version compacte (pour la sidebar)
<TokenStatus compact />

// Version sans icône
<TokenStatus showIcon={false} />`}
              language="tsx"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
