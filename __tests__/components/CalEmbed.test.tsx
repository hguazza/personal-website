import { render } from '@testing-library/react'
import CalEmbed from '@/components/CalEmbed'

describe('CalEmbed', () => {
  it('renders the cal embed container', () => {
    render(<CalEmbed calLink="henrique" />)
    expect(document.getElementById('cal-embed')).toBeInTheDocument()
  })
})
