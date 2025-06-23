import { Clock, User, FileText, MessageSquare } from 'lucide-react';

export interface Activity {
  id: string;
  type: 'lead' | 'proposal' | 'task' | 'message';
  title: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    avatar?: string;
  };
}

interface RecentActivitiesProps {
  activities: Activity[];
  title: string;
}

export function RecentActivities({ activities, title }: RecentActivitiesProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'lead':
        return <User className="text-blue-500" size={16} />;
      case 'proposal':
        return <FileText className="text-orange-500" size={16} />;
      case 'task':
        return <Clock className="text-green-500" size={16} />;
      case 'message':
        return <MessageSquare className="text-purple-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <a href="#" className="text-sm font-medium text-orange-600 hover:text-orange-500">
          Ver todas
        </a>
      </div>
      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-center text-sm text-gray-500">Nenhuma atividade recente</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 border-b border-gray-100 pb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <span className="text-xs text-gray-500">{activity.timestamp}</span>
                </div>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <div className="flex items-center">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 text-xs font-medium text-orange-600">
                    {activity.user.avatar || activity.user.name.charAt(0)}
                  </div>
                  <span className="ml-1.5 text-xs text-gray-500">{activity.user.name}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
