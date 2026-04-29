import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { StatusBadge } from "@/components/UI/StatusBadge";
import { Modal } from "@/components/common/Modal";
import { Eye } from "lucide-react";

export const AdminOrders = () => {
  const { orders, loading, updateOrderStatus } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const filteredOrders = statusFilter
    ? orders.filter((order) => order.status === statusFilter)
    : orders;

  const handleStatusChange = async (id: number, status: string) => {
    await updateOrderStatus(id, status as any);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>

      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.article_title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer_name}
                      <br />
                      <span className="text-xs text-gray-500">
                        {order.customer_phone}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{order.total_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900">Order Information</h3>
              <p className="text-sm text-gray-600">Order #{selectedOrder.id}</p>
              <p className="text-sm text-gray-600">
                Date: {new Date(selectedOrder.created_at).toLocaleString()}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Article Details</h3>
              <p className="text-sm text-gray-600">
                Title: {selectedOrder.article_title}
              </p>
              {selectedOrder.article_author && (
                <p className="text-sm text-gray-600">
                  Author: {selectedOrder.article_author}
                </p>
              )}
              <p className="text-sm text-gray-600">
                Quantity: {selectedOrder.quantity}
              </p>
              <p className="text-sm text-gray-600">
                Total: ₹{selectedOrder.total_amount}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Customer Details</h3>
              <p className="text-sm text-gray-600">
                Name: {selectedOrder.customer_name}
              </p>
              <p className="text-sm text-gray-600">
                Phone: {selectedOrder.customer_phone}
              </p>
              {selectedOrder.customer_email && (
                <p className="text-sm text-gray-600">
                  Email: {selectedOrder.customer_email}
                </p>
              )}
              <p className="text-sm text-gray-600">
                Address: {selectedOrder.customer_address}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900">Payment</h3>
              <p className="text-sm text-gray-600">
                Method: {selectedOrder.payment_method}
              </p>
              <p className="text-sm text-gray-600">
                Status: <StatusBadge status={selectedOrder.status} />
              </p>
            </div>

            {selectedOrder.notes && (
              <div>
                <h3 className="font-semibold text-gray-900">Notes</h3>
                <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
