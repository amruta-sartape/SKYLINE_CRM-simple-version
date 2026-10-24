import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  title = 'No records found',
  description = 'No matching entries currently available for the selected view.',
  action,
  icon: Icon = Inbox
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-slate-800 tracking-tight">
        {title}
      </h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
