import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-surface py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
            Streamline Your B2B Purchasing
          </h1>
          <p className="mt-6 text-lg leading-8 text-secondary">
            Consolidate and track all your vendor purchases in one place. Manage documents, track deliveries, and optimize your container space utilization effortlessly.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg">
              Get started
            </Button>
            <Button variant="link" size="lg">
              Learn more <span aria-hidden="true">→</span>
            </Button>
          </div>
        </div>
        <div className="mt-16 flow-root sm:mt-24">
          <div className="relative rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
            <div className="rounded-lg bg-white shadow-2xl ring-1 ring-gray-900/10">
              <div className="p-8">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-semibold">Purchase Dashboard</h2>
                  <div className="flex gap-4">
                    <Button variant="outline" size="sm">Filter</Button>
                    <Button variant="outline" size="sm">Export</Button>
                  </div>
                </div>
                
                {/* Purchase Summary Cards */}
                <div className="grid grid-cols-4 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Purchases</p>
                    <p className="text-2xl font-bold">$124,500</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Active Orders</p>
                    <p className="text-2xl font-bold">28</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Volume (m³)</p>
                    <p className="text-2xl font-bold">65.2</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Available Space (m³)</p>
                    <p className="text-2xl font-bold text-green-600">14.8</p>
                  </div>
                </div>

                {/* Container Utilization */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">Container Space Utilization</h3>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Used: 65.2m³ (81.5%)</span>
                      <span className="text-sm text-gray-600">Available: 14.8m³ (18.5%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "81.5%" }}></div>
                    </div>
                  </div>
                </div>

                {/* Purchase Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume (m³)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Supplier Co.</td>
                        <td className="px-6 py-4 whitespace-nowrap">#ORD-2024-001</td>
                        <td className="px-6 py-4 whitespace-nowrap">$45,000</td>
                        <td className="px-6 py-4 whitespace-nowrap">28.5</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Delivered</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-blue-600">View (3)</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">Global Vendors Ltd.</td>
                        <td className="px-6 py-4 whitespace-nowrap">#ORD-2024-002</td>
                        <td className="px-6 py-4 whitespace-nowrap">$28,750</td>
                        <td className="px-6 py-4 whitespace-nowrap">36.7</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">In Transit</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-blue-600">View (2)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;