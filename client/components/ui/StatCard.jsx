const StatCard = ({title, amount, icon, color})
  return (
    <div>
      <div>
        {icon}
      </div>
      <div>
        <h3>{title}</h3>
        <p>{amount}</p>
      </div>
    </div>
  )


export default StatCard