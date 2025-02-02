import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-surface py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-6xl">
            Streamline Your Turkish Purchasing
          </h1>
          <p className="mt-6 text-base sm:text-lg leading-8 text-secondary">
            Consolidate and track all your vendor purchases in one place. Manage documents, track deliveries, and optimize your container space utilization effortlessly.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-4 sm:gap-x-6">
            <Button 
              size="lg"
              className="bg-primary text-surface hover:bg-primary/90 transition-colors"
            >
              Get started
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              className="text-secondary hover:text-primary hover:bg-accent/10"
            >
              Learn more <span aria-hidden="true">→</span>
            </Button>
          </div>
        </div>

        <div className="mt-12 sm:mt-16 lg:mt-24">
          <div className="relative mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <div className="rounded-lg bg-white shadow-2xl ring-1 ring-gray-900/10">
                <div className="p-4 sm:p-8">
                  {/* Dashboard Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
                    <h2 className="text-xl font-semibold mb-4 sm:mb-0">Purchase Dashboard</h2>
                    <div className="flex gap-4">
                      <Button variant="outline" size="sm">Filter</Button>
                      <Button variant="outline" size="sm">Export</Button>
                    </div>
                  </div>
                  
                  {/* Purchase Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Purchases</p>
                      <p className="text-xl sm:text-2xl font-bold">$198,750</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Active Orders</p>
                      <p className="text-xl sm:text-2xl font-bold">42</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Volume (m³)</p>
                      <p className="text-xl sm:text-2xl font-bold">52.4</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Available Space (m³)</p>
                      <p className="text-xl sm:text-2xl font-bold text-green-600">7.6</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Account Balance</p>
                      <p className="text-xl sm:text-2xl font-bold text-blue-600">$45,250</p>
                    </div>
                  </div>

                  {/* Container Utilization */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-4">Container Space Utilization</h3>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row justify-between mb-2">
                        <span className="text-sm text-gray-600 mb-1 sm:mb-0">Used: 52.4m³ (87.3%)</span>
                        <span className="text-sm text-gray-600">Available: 7.6m³ (12.7%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: "87.3%" }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Table */}
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                      <div className="overflow-hidden rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Volume (m³)</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documents</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">Supplier Co.</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">#ORD-2024-001</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">$45,000</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">15.2</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Delivered</span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600">View (3)</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">Global Vendors Ltd.</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">#ORD-2024-002</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">$28,750</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">18.5</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">In Transit</span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600">View (2)</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">Asia Trade Partners</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">#ORD-2024-003</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">$65,000</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">12.4</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Processing</span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600">View (4)</td>
                            </tr>
                            <tr>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">Eastern Exports Co.</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">#ORD-2024-004</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">$60,000</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm">6.3</td>
                              <td className="px-4 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">Pending</span>
                              </td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600">View (1)</td>
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
        </div>
      </div>
    </div>
  );
};

export default Hero;
