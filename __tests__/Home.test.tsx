import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home', () => {
    it('renders the main heading', () => {
        render(<Home />)
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()
        expect(heading).toHaveTextContent('Alpine Sanctuary.')
    })

    it('renders the things to do section', () => {
        render(<Home />)
        expect(screen.getByText('Things to Do')).toBeInTheDocument()
        expect(screen.getByText('Revelstoke Mountain Resort')).toBeInTheDocument()
    })
})
