import { CaseService } from './CaseService';
import { AlertService } from './AlertService';
import { UserService } from './UserService';
import type { Case } from '../../types/case';
import type { Alert } from '../../types/alert';

export interface DashboardStats {
  cases: {
    total: number;
    active: number;
    closed: number;
    unverified: number;
    totalRecovered: number;
  };
  alerts: {
    total: number;
    new: number;
    investigating: number;
    resolved: number;
    high: number;
    critical: number;
  };
  users: {
    total: number;
  };
}

export interface DashboardData {
  stats: DashboardStats;
  recentCases: Case[];
  recentAlerts: Alert[];
}

export class DashboardService {
  static async getDashboardData(): Promise<DashboardData> {
    try {
      console.log('Fetching dashboard data...');
      
      // Fetch all data in parallel
      const [cases, alerts, users, recentAlerts] = await Promise.all([
        CaseService.getAllCases(),
        AlertService.getAlertStats(),
        UserService.getAllUsers(),
        AlertService.getRecentAlerts(5)
      ]);

      console.log('Fetched cases:', cases.length);
      console.log('Fetched alerts stats:', alerts);
      console.log('Fetched users:', users.length);
      console.log('Fetched recent alerts:', recentAlerts.length);

      // Calculate case statistics
      const caseStats = {
        total: cases.length,
        active: cases.filter(c => c.status === 'active').length,
        closed: cases.filter(c => c.status === 'closed').length,
        unverified: cases.filter(c => c.status === 'unverified').length,
        totalRecovered: cases.reduce((sum, c) => sum + (c.amountInvolved || 0), 0)
      };

      // Get recent cases (last 5 active/unverified cases)
      const recentCases = cases
        .filter(c => c.status === 'active' || c.status === 'unverified')
        .sort((a, b) => b.dateOpened.toMillis() - a.dateOpened.toMillis())
        .slice(0, 5);

      const dashboardData: DashboardData = {
        stats: {
          cases: caseStats,
          alerts: alerts,
          users: {
            total: users.length
          }
        },
        recentCases,
        recentAlerts
      };

      console.log('Dashboard data prepared:', dashboardData);
      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Return empty data structure on error
      return {
        stats: {
          cases: {
            total: 0,
            active: 0,
            closed: 0,
            unverified: 0,
            totalRecovered: 0
          },
          alerts: {
            total: 0,
            new: 0,
            investigating: 0,
            resolved: 0,
            high: 0,
            critical: 0
          },
          users: {
            total: 0
          }
        },
        recentCases: [],
        recentAlerts: []
      };
    }
  }

  static formatCurrency(amount: number, currency: string = 'INR'): string {
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    return `${amount.toLocaleString()}`;
  }

  static formatDate(timestamp: any): string {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle Firebase Timestamp
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('en-IN');
      }
      // Handle regular Date
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString('en-IN');
      }
      // Handle string dates
      if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleDateString('en-IN');
      }
      return 'N/A';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  }

  static getBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status.toLowerCase()) {
      case 'active':
      case 'new':
        return 'default';
      case 'investigating':
      case 'unverified':
        return 'secondary';
      case 'closed':
      case 'resolved':
        return 'outline';
      case 'high':
      case 'critical':
        return 'destructive';
      default:
        return 'secondary';
    }
  }
}
