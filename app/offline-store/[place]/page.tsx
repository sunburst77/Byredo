type Props = {
  params: {
    place: string
  }
}

export default function PlacePage({ params }: Props) {
  return (
    <main>
      <h1>Place: {params.place}</h1>
    </main>
  )
}
