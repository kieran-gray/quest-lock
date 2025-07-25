const secrets = (window as any).secrets
const SECRET_LENGTH = 32

const random = (min = 0, max = 1) =>
  Math.floor(Math.random() * (max + 1 - min) + min)
const randomLower = () => String.fromCharCode(random(97, 122))
const randomUpper = () => String.fromCharCode(random(65, 90))
const randomSymbol = () => {
  const symbols = "~*$%@#^&!?*'-=/,.{}()[]<>"
  return symbols[random(0, symbols.length - 1)]
}

export function generateSecret() {
  let password = ''
  for (let i = 0; i < SECRET_LENGTH; i++) {
    const choice = random(0, 3)
    if (choice === 0) password += randomLower()
    else if (choice === 1) password += randomUpper()
    else if (choice === 2) password += randomSymbol()
    else if (choice === 3) password += random(0, 9)
    else i--
  }
  return password
}

export function createShares(
  secret: string,
  numShares: number,
  threshold: number
) {
  const secretHex = secrets.str2hex(secret)
  return secrets.share(secretHex, numShares, threshold)
}

export function combineShares(shares: string[], threshold: number) {
  const sharesToUse = shares.slice(0, threshold)

  const reconstructedHex = secrets.combine(sharesToUse)
  return secrets.hex2str(reconstructedHex)
}
