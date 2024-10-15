export interface Geolocation {
  lat: string;
  long: string;
}

export interface Address {
  geolocation: Geolocation;
  city: string;
  street: string;
  number: number;
  zipcode: string;
}

export interface Name {
  firstname: string;
  lastname: string;
}

export interface JwtToken {
  iat?: number;
  exp?: number;
}

export interface TokenData extends JwtToken {
  sub: string;
}

export interface ValidateTokenResponse extends TokenData {
  token: string;
}
