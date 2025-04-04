type HeaderProps = {
  name: string;
  onRestock?: () => void; // New prop for the restock button
};

const Header = ({ name, onRestock }: HeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-semibold text-gray-700">{name}</h1>
      
      {/* Conditionally rendering buttons based on provided props */}
      <div className="flex gap-4">


        {onRestock && (
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            onClick={onRestock}
          >
            Restock
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
