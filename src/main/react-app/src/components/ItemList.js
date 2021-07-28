
export default function ItemList({items, openItem}) {
    return (
          items.map(item => (
            <div key={item.id} onClick={() => openItem(item)}>
              {item.title}
            </div>
          ))
    );
  }
  