import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: () => void;
  actionLabel?: string;
  icon?: React.ReactNode;
  error?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Tidak ada data',
  description,
  action,
  actionLabel = 'Muat Ulang',
  icon,
  error,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">
        {icon || (
          <AlertCircle
            className={`h-12 w-12 ${error ? 'text-red-400' : 'text-gray-300'}`}
          />
        )}
      </div>
      <h3 className="text-base font-medium text-gray-700">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>
      )}
      {action && (
        <Button
          variant="outline"
          className="mt-4"
          onClick={action}
          icon={<RefreshCw className="h-4 w-4" />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
