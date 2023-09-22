import { useEffect, useState } from "react";

// const initialFriends = [
//   {
//     id: 118836,
//     name: "Clark",
//     image: "https://i.pravatar.cc/48?u=118836",
//     balance: -7,
//   },
//   {
//     id: 933372,
//     name: "Sarah",
//     image: "https://i.pravatar.cc/48?u=933372",
//     balance: 20,
//   },
//   {
//     id: 499476,
//     name: "Anthony",
//     image: "https://i.pravatar.cc/48?u=499476",
//     balance: 0,
//   },
// ];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    async function fetchapi() {
      try {
        const res = await fetch("http://localhost:5000/");
        const data = await res.json();
        setFriends(data);
      } catch (e) {
        console.log(e);
      }
    }
    fetchapi();
  }, [friends]);

  async function handleSetFriends(friend) {
    try {
      await fetch("http://localhost:5000/new", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Adjust the content type as needed
        },
        body: JSON.stringify(friend),
      });
      // const data = await res.json();
    } catch (e) {
      console.log(e);
    }
    setIsOpen(false);
  }

  function handleAddForm() {
    setIsOpen((isOpen) => !isOpen);
    setCurrent(null);
  }
  function handleCurrent(friend) {
    setCurrent((current) => (current?._id === friend._id ? null : friend));
    setIsOpen(false);
  }
  async function handleSplitBill(value) {
    try {
      const res = await fetch("http://localhost:5000/update", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json", // Adjust the content type as needed
        },
        body: JSON.stringify({id:current._id , balance:value}),
      });
      const data = await res.json();
      console.log(data)
    } catch (e) {
      console.log(e);
    }
    setIsOpen(false);
    setCurrent(null);
  }

  return (
    <div className="app">
      <div className="sidebar">
        <FriendList
          friends={friends}
          handleClick={handleCurrent}
        />
        {isOpen && <AddFriendForm setFriends={handleSetFriends} />}
        <Button handleClick={handleAddForm}>
          {isOpen ? "Close" : "Add friend"}
        </Button>
      </div>
      {current && (
        <BillForm key={current._id} current={current} handleSplitBill={handleSplitBill}/>
      )}
    </div>
  );
}

function Button({ children, handleClick }) {
  return (
    <button className="button" onClick={handleClick}>
      {children}
    </button>
  );
}

function FriendList({ friends, handleClick, current }) {
  return (
    <ul>
      {friends.map((friend) => (
        <Friend
          friend={friend}
          key={friend._id}
          handleClick={handleClick}
          current={current}
        />
      ))}
    </ul>
  );
}

function Friend({ friend, handleClick, current }) {
  // const [balance, setBalance] = useState(friend.balance);
  const isSelected = friend._id === current?._id;
  return (
    <li className={isSelected ? "selected" : ""}>
      <img src={friend.image} alt="" />
      <h3>{friend.name}</h3>
      {friend.balance === 0 ? (
        <p>{`You and ${friend.name} are even`}</p>
      ) : friend.balance < 0 ? (
        <p className="red">{`You owe ${friend.name} ${Math.abs(
          friend.balance
        )}$`}</p>
      ) : (
        <p className="green">{`${friend.name} owe you ${friend.balance}$`}</p>
      )}
      <Button handleClick={() => handleClick(friend)}>
        {isSelected ? "close" : "Select"}
      </Button>
    </li>
  );
}

function AddFriendForm({ setFriends }) {
  const [name, setName] = useState("");
  const [imgUrl, setImgUrl] = useState("https://i.pravatar.cc/48");
  const newFriend = {
    name,
    image: imgUrl,
    balance: 0,
  };
  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !imgUrl) return;
    setFriends(newFriend);
    setName("");
    setImgUrl("https://i.pravatar.cc/48");
  }
  return (
    <form
      className="form-add-friend"
      action=""
      onSubmit={(e) => handleSubmit(e)}
    >
      <label htmlFor="name">🏃Friend name</label>
      <input
        type="text"
        id="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <label htmlFor="imgUrl">🖼️Image URL</label>
      <input
        type="text"
        id="imgUrl"
        value={imgUrl}
        onChange={(e) => setImgUrl(e.target.value)}
      />
      <Button>Add</Button>
    </form>
  );
}

function BillForm({ current, handleSplitBill }) {
  const [billValue, setBillValue] = useState('');
  const [yourValue, setYourValue] = useState('');
  const friendExpense = billValue ? billValue - yourValue : "";
  const [whoPaying, setWhoPaying] = useState("you");
  let final;

  // function handleBill(bill, yourValue, who) {
  //   setBillValue(bill);
  //   setYourValue(yourValue);
  //   if (who !== "you") setWhoPaying("friend");
  // }
  function handleSubmit(e) {
    e.preventDefault();
    if (!billValue) return;
    whoPaying === "you" ? (final = friendExpense) : (final = -yourValue);
    handleSplitBill(final);
    // setOwe(final);
  }

  return (
    <form
      action=""
      className="form-split-bill"
      onSubmit={(e) => handleSubmit(e)}
    >
      <h2>Split Bill with {current.name}</h2>
      <label htmlFor="">Bill Value</label>
      <input
        type="number"
        value={billValue}
        onChange={(e) => setBillValue(Number(e.target.value))}
      />
      <label htmlFor="">Your Expense</label>
      <input
        type="number"
        value={yourValue}
        onChange={(e) =>
          setYourValue(
            Number(e.target.value) > billValue
              ? yourValue
              : Number(e.target.value)
          )
        }
      />
      <label htmlFor="">{current.name}'s Expense</label>
      <input type="number" disabled value={friendExpense} />
      <label htmlFor="">Who is paying the bill</label>
      <select
        id=""
        value={whoPaying}
        onChange={(e) => setWhoPaying(e.target.value)}
      >
        <option value="user">You</option>
        <option value="friend">Friend</option>
      </select>
      <Button>Split Bill</Button>
    </form>
  );
}
