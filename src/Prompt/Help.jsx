import { VERSION } from '..'

const Kbd = ({ title, children }) => (
  <kbd
    style={{
      display: 'inline-block',
      padding: '0.2em 0.4em',
      fontSize: '0.85em',
      fontFamily: 'monospace',
      lineHeight: 1.5,
      color: '#444',
      verticalAlign: 'middle',
      backgroundColor: '#f7f7f9',
      border: '1px solid #ccc',
      borderRadius: '3px',
      boxShadow: 'inset 0 -1px 0 #ccc',
    }}
    title={title}
  >
    {children}
  </kbd>
)

const Shift = () => <Kbd title="Shift">⇧</Kbd>
const Ctrl = () => <Kbd title="Ctrl">Ctrl</Kbd>
const Alt = () => <Kbd title="Alt">Alt</Kbd>
const Backspace = () => <Kbd title="Backspace">⌫</Kbd>
const ArrowUp = () => <Kbd title="ArrowUp">↑</Kbd>
const ArrowDown = () => <Kbd title="ArrowDown">↓</Kbd>
const PageUp = () => <Kbd title="PageUp">⇞</Kbd>
const PageDown = () => <Kbd title="PageDown">⇟</Kbd>
const Tab = () => <Kbd title="Tab">⭾</Kbd>
const Key = ({ chr }) => <Kbd title={chr}>{chr}</Kbd>

const Command = ({ children }) => (
  <code
    style={{
      fontFamily: 'monospace',
      display: 'inline-block',
      padding: '0.2em 0.4em',
      lineHeight: 1.5,
      color: '#222',
      verticalAlign: 'middle',
    }}
  >
    {children}
  </code>
)

const ItemGroup = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '1em' }}>
    {children}
  </div>
)

const Item = ({ shortcut, children }) => (
  <div
    style={{
      display: 'flex',
      margin: '0.25em',
      padding: '0.5em',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#f7f7f9',
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column' }}>{shortcut}</div>
    <div style={{ fontSize: '1.2em', marginLeft: '1em', textAlign: 'right' }}>
      {children}
    </div>
  </div>
)

const Shortcut = ({ children }) => (
  <div
    style={{
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
)

export default function Help() {
  return (
    <aside style={{ paddingBottom: '16px', fontSize: '.9em' }}>
      <h2>Welcome to Kalong v{VERSION}</h2>
      <p>
        <strong>Keyboard shortcuts</strong>
      </p>
      <ItemGroup>
        <Item
          shortcut={
            <>
              <Shortcut>
                <ArrowUp />
              </Shortcut>
              <Shortcut>
                <ArrowDown />
              </Shortcut>
            </>
          }
        >
          Scroll through history
        </Item>
        <Item
          shortcut={
            <Shortcut>
              <Shift /> + <Backspace />
            </Shortcut>
          }
        >
          Remove last answer
        </Item>
        <Item
          shortcut={
            <Shortcut>
              <Tab />
            </Shortcut>
          }
        >
          Indent or complete
        </Item>
        <Item
          shortcut={
            <Shortcut>
              <Ctrl /> + <Key chr="c" />
            </Shortcut>
          }
        >
          Clear prompt
        </Item>
        <Item
          shortcut={
            <Shortcut>
              <Ctrl /> + <Key chr="d" />
            </Shortcut>
          }
        >
          On empty prompt, close the terminal
        </Item>
        <Item
          shortcut={
            <Shortcut>
              <Ctrl /> + <Key chr="l" />
            </Shortcut>
          }
        >
          Clear screen
        </Item>
        <Item
          shortcut={
            <>
              <Shortcut>
                <Ctrl /> + <Shift /> + <Key chr="r" />
              </Shortcut>
              <Shortcut>
                <Ctrl /> + <Shift /> + <Key chr="s" />
              </Shortcut>
            </>
          }
        >
          Search command history (case insensitive)
        </Item>
        <Item
          shortcut={
            <>
              <Shortcut>
                <Shift /> + <PageUp />
              </Shortcut>
              <Shortcut>
                <Shift /> + <PageDown />
              </Shortcut>
            </>
          }
        >
          Scroll through scrollback
        </Item>
        <Item
          shortcut={
            <>
              <Shortcut>
                <Alt /> + <ArrowUp />
              </Shortcut>
              <Shortcut>
                <Alt /> + <ArrowDown />
              </Shortcut>
            </>
          }
        >
          Complete from history arguments
        </Item>
      </ItemGroup>
      <p>
        <strong>Commands</strong>
      </p>
      <ItemGroup>
        <Item
          shortcut={
            <>
              <Command>?help</Command>
              <Shortcut>
                <Alt /> + <Key chr="h" />
              </Shortcut>
            </>
          }
        >
          Show this help message
        </Item>
        <Item
          shortcut={
            <>
              <Command>?inspect &lt;value&gt;</Command>
              <Shortcut>
                <Alt /> + <Key chr="i" />
              </Shortcut>
            </>
          }
        >
          Inspect a value
        </Item>
        <Item
          shortcut={
            <>
              <Command>?diff &lt;value1&gt; ? &lt;value2&gt;</Command>
              <Shortcut>
                <Alt /> + <Key chr="d" />
              </Shortcut>
            </>
          }
        >
          Show the diff between two values
        </Item>
        <Item
          shortcut={
            <>
              <Command>?table &lt;value&gt; ? &lt;colums&gt;</Command>
              <Shortcut>
                <Alt /> + <Key chr="t" />
              </Shortcut>
            </>
          }
        >
          View the iterable value columns properties as a table
        </Item>
      </ItemGroup>
    </aside>
  )
}
