import { useState } from "react";

const PaymentForm = ({ onPaymentSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePay = () => {
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);

      setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="h-full rounded-xl bg-white p-6 text-center shadow-xl dark:bg-gray-800">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center px-20 py-12">
          <svg
            className="h-20 w-20 animate-bounce text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-2xl font-bold text-green-600">
            Payment Successful!
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your Premium plan is now active.
          </p>
        </div>
      ) : (
        <>
          <h3 className="mb-4 text-xl font-bold text-violet-600">
            Payment Processing
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            The Premium plan will be activated after payment is complete.
          </p>

          {loading ? (
            <div className="flex flex-col items-center py-12 text-violet-500">
              <svg
                className="h-8 w-8 animate-spin text-violet-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <div className="mt-3">Processing Payment...</div>
            </div>
          ) : (
            <>
              <p className="mb-6 text-2xl font-semibold dark:text-white">
                Total: 0 IDR
              </p>
              <button
                onClick={handlePay}
                className="mb-3 w-full rounded-md bg-green-500 py-2 text-white transition hover:bg-green-600"
              >
                Pay Now
              </button>
              <button
                onClick={onCancel}
                className="w-full py-2 text-sm text-gray-500 transition hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Cancel Payment
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default function SubscriptionModal({ onPaymentSuccess, onClose }) {
  const [stage, setStage] = useState("plan");

  const handleChoosePlan = () => {
    setStage("payment");
  };

  const handleCancel = () => {
    if (stage === "payment") {
      setStage("plan");
    } else {
      onClose();
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-white">
      <div className="min-h-screen w-full sm:max-w-lg">
        {stage === "plan" && (
          <div className="relative isolate rounded-xl bg-white px-6 py-8 shadow-2xl sm:py-16 lg:px-8 dark:bg-gray-900">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400">
                Premium Access
              </h2>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-balance text-gray-900 sm:text-5xl dark:text-white">
                Choose the right plan for you
              </p>
            </div>

            <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20">
              <div className="rounded-3xl bg-white/60 p-8 ring-1 ring-gray-900/10 sm:p-10 dark:bg-white/2.5 dark:ring-white/10">
                <h3
                  id="tier-hobby"
                  className="text-base/7 font-semibold text-indigo-600 dark:text-indigo-400"
                >
                  Basic (Free)
                </h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    0 IDR
                  </span>
                  <span className="text-base text-gray-500 dark:text-gray-400">
                    / forever
                  </span>
                </p>
                <p className="mt-6 text-base/7 text-gray-600 dark:text-gray-300">
                  The perfect plan if you are just starting with our product.
                </p>
                <ul
                  role="list"
                  className="mt-8 space-y-2 text-sm/6 text-gray-600 sm:mt-4 dark:text-gray-300"
                >
                  <li className="flex gap-x-3">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      data-slot="icon"
                      aria-hidden="true"
                      className="h-6 w-5 flex-none text-indigo-600 dark:text-indigo-400"
                    >
                      <path
                        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                        clipRule="evenodd"
                        fillRule="evenodd"
                      />
                    </svg>
                    Max. 5 activities per day
                  </li>
                </ul>
                <button
                  onClick={onClose}
                  aria-describedby="tier-hobby"
                  className="mt-8 block w-full rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-indigo-600 ring-1 ring-indigo-200 ring-inset hover:ring-indigo-300 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:mt-10 dark:bg-white/10 dark:text-white dark:ring-white/5 dark:hover:bg-white/20 dark:hover:ring-white/5 dark:focus-visible:outline-white/75"
                >
                  Stay on Basic Plan
                </button>
              </div>

              <div className="relative rounded-3xl bg-gray-900 p-8 shadow-2xl ring-1 ring-gray-900/10 sm:p-10 dark:bg-gray-800 dark:shadow-none dark:ring-white/10">
                <h3
                  id="tier-enterprise"
                  className="text-base/7 font-semibold text-indigo-400"
                >
                  Premium
                </h3>
                <p className="mt-4 flex items-baseline gap-x-2">
                  <span className="text-4xl font-semibold tracking-tight text-white">
                    0 IDR
                  </span>
                  <span className="text-base text-gray-400">/ month</span>
                </p>
                <p className="mt-6 text-base/7 text-gray-300">
                  Dedicated support and infrastructure for your unlimited
                  schedule.
                </p>
                <ul
                  role="list"
                  className="mt-8 space-y-2 text-sm/6 text-gray-300 sm:mt-6"
                >
                  <li className="flex gap-x-3">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      data-slot="icon"
                      aria-hidden="true"
                      className="h-6 w-5 flex-none text-indigo-400"
                    >
                      <path
                        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                        clipRule="evenodd"
                        fillRule="evenodd"
                      />
                    </svg>
                    Unlimited activities
                  </li>
                </ul>
                <button
                  onClick={handleChoosePlan}
                  aria-describedby="tier-enterprise"
                  className="mt-8 block w-full rounded-md bg-indigo-500 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 sm:mt-10 dark:shadow-none"
                >
                  Select Plan & Proceed
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === "payment" && (
          <div className="flex min-h-[90vh] items-center justify-center">
            <PaymentForm
              onPaymentSuccess={onPaymentSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
}
