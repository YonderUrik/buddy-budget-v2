import { useLiquidityAccounts } from "@/providers/liquidity-accounts-provider";

export function AccountsList() {
  const { 
    accounts, 
    loading, 
    error, 
    addAccount, 
    updateAccount, 
    deleteAccount 
  } = useLiquidityAccounts();

  if (loading) return <div>Loading accounts...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleAddAccount = async () => {
    try {
      await addAccount({
        userId: "user123", // This would come from auth context in a real app
        name: "New Account",
        type: "checking",
        balance: 0,
        isActive: true,
      });
    } catch (err) {
      console.error("Failed to add account:", err);
    }
  };

  const handleUpdateAccount = async (id: string) => {
    try {
      await updateAccount(id, { balance: 1000 });
    } catch (err) {
      console.error("Failed to update account:", err);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    try {
      await deleteAccount(id);
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

  return (
    <div>
      <h2>Your Accounts</h2>
      <button onClick={handleAddAccount}>Add New Account</button>
      
      {accounts.length === 0 ? (
        <p>No accounts found.</p>
      ) : (
        <ul>
          {accounts.filter(account => !account.isDeleted).map(account => (
            <li key={account.id}>
              <h3>{account.name}</h3>
              <p>Type: {account.type}</p>
              <p>Balance: ${account.balance.toFixed(2)}</p>
              <button onClick={() => handleUpdateAccount(account.id)}>
                Update Balance
              </button>
              <button onClick={() => handleDeleteAccount(account.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 