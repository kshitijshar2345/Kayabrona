package com.ecommerce.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

// ROOT CAUSE OF ALL JWT ERRORS:
// Your pom.xml has jjwt 0.11.x but the API calls were mixed between versions.
// JJWT 0.11.x needs:  parserBuilder().setSigningKey(Key).build().parseClaimsJws()
// JJWT 0.9.x needs:   parser().setSigningKey(String).parseClaimsJws()
// This file uses the CORRECT 0.11.x API throughout.
//
// Make sure your pom.xml has EXACTLY these 3 dependencies (not the old single jjwt):
//
// <dependency>
//     <groupId>io.jsonwebtoken</groupId>
//     <artifactId>jjwt-api</artifactId>
//     <version>0.11.5</version>
// </dependency>
// <dependency>
//     <groupId>io.jsonwebtoken</groupId>
//     <artifactId>jjwt-impl</artifactId>
//     <version>0.11.5</version>
//     <scope>runtime</scope>
// </dependency>
// <dependency>
//     <groupId>io.jsonwebtoken</groupId>
//     <artifactId>jjwt-jackson</artifactId>
//     <version>0.11.5</version>
//     <scope>runtime</scope>
// </dependency>

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration}")
    private long expiration;

    // Build a Key object from the secret string — required by jjwt 0.11.x
    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // Called from AuthService with plain email string
    public String generateToken(String email) {
        Map<String, Object> claims = new HashMap<>();
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Overload — called by JwtFilter via Spring Security
    public String generateToken(UserDetails userDetails) {
        return generateToken(userDetails.getUsername());
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        return claimsResolver.apply(extractAllClaims(token));
    }

    private Claims extractAllClaims(String token) {
        // jjwt 0.11.x: parserBuilder() + Key object (NOT parser() + String)
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }
}