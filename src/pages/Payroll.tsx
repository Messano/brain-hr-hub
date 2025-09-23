import { Plus, Search, Filter, Download, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KPICard } from "@/components/KPICard";

export default function Payroll() {
  const payrolls = [
    {
      employee: "Marie Dupont",
      period: "Janvier 2024",
      grossSalary: "4,500€",
      netSalary: "3,420€",
      status: "paid",
      payDate: "31/01/2024"
    },
    {
      employee: "Jean Martin",
      period: "Janvier 2024", 
      grossSalary: "5,200€",
      netSalary: "3,950€",
      status: "pending",
      payDate: "31/01/2024"
    },
    {
      employee: "Sophie Bernard",
      period: "Janvier 2024",
      grossSalary: "3,800€",
      netSalary: "2,890€",
      status: "paid",
      payDate: "31/01/2024"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success text-success-foreground">Payée</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground">En attente</Badge>;
      case 'processing':
        return <Badge className="bg-primary text-primary-foreground">En cours</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paie</h1>
          <p className="text-muted-foreground">Gestion des bulletins de paie et traitements</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Nouveau bulletin</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard
          title="Bulletins générés"
          value="142"
          icon={Calendar}
        />
        <KPICard
          title="Payés ce mois"
          value="138"
          change="97% de traitement"
          icon={Plus}
          variant="success"
        />
        <KPICard
          title="En attente"
          value="4"
          icon={Search}
          variant="warning"
        />
        <KPICard
          title="Masse salariale"
          value="587K€"
          change="+2.3% vs. mois dernier"
          icon={Filter}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un employé..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Période
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Statut
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payrolls List */}
      <div className="grid gap-4">
        {payrolls.map((payroll, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{payroll.employee}</h3>
                  <p className="text-muted-foreground">{payroll.period}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Payé le {payroll.payDate}
                    </span>
                  </div>
                </div>
                
                <div className="text-right space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Brut: {payroll.grossSalary}</p>
                    <p className="font-semibold text-lg text-success">Net: {payroll.netSalary}</p>
                  </div>
                  {getStatusBadge(payroll.status)}
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Voir
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}