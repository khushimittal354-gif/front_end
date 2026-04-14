import React from 'react';

const FinancePage = () => {
  const userRole = 'FINANCE';

  const GENERAL = ['Your Bank', 'Your Investments', 'Your Card','Your Reports'];

  const FINANCE_OPERATIONS = ['Bank Operations', 'Investments Operations', 'Salary Processing','Reports Generations'];

  return (
    <div className="space-y-8 p-6">
      <div className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
        <h1 className="mb-4 w-fit rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-lg font-semibold text-slate-900">
          General Operations
        </h1>

        <div className="flex flex-wrap gap-3">
          {GENERAL.map((item) => (
            <div
              key={item}
              className="rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900"
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {userRole === 'FINANCE' && (
        <div className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm">
          <h1 className="mb-4 w-fit rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-lg font-semibold text-slate-900">
            Finance Operations
          </h1>

          <div className="flex flex-wrap gap-3">
            {FINANCE_OPERATIONS.map((item) => (
              <div
                key={item}
                className="rounded-md border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;