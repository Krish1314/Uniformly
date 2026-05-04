# Graph Report - Uniformly  (2026-05-04)

## Corpus Check
- 103 files · ~65,166 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 406 nodes · 516 edges · 22 communities detected
- Extraction: 70% EXTRACTED · 30% INFERRED · 0% AMBIGUOUS · INFERRED: 155 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f886677e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 36|Community 36]]

## God Nodes (most connected - your core abstractions)
1. `Product` - 27 edges
2. `Address` - 21 edges
3. `Order` - 17 edges
4. `from()` - 17 edges
5. `useAuth()` - 15 edges
6. `BaseEntity` - 14 edges
7. `ProductVariant` - 14 edges
8. `User` - 13 edges
9. `OrderRepository` - 11 edges
10. `from()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `AdminRoute()` --calls--> `useAuth()`  [INFERRED]
  frontend/src/components/AdminRoute.jsx → frontend/src/context/AuthContext.jsx
- `ProtectedRoute()` --calls--> `useAuth()`  [INFERRED]
  frontend/src/components/ProtectedRoute.jsx → frontend/src/context/AuthContext.jsx
- `Profile()` --calls--> `useAuth()`  [INFERRED]
  frontend/src/pages/Profile.jsx → frontend/src/context/AuthContext.jsx
- `Login()` --calls--> `useAuth()`  [INFERRED]
  frontend/src/pages/Login.jsx → frontend/src/context/AuthContext.jsx
- `Register()` --calls--> `useAuth()`  [INFERRED]
  frontend/src/pages/Register.jsx → frontend/src/context/AuthContext.jsx

## Communities (56 total, 15 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (5): AdminProductService, from(), Category, Product, from()

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (6): AdminOrderService, Order, OrderItem, from(), OrderStatusHistoryRepository, from()

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (8): AddressController, AddressRepository, SecurityUtils, CartController, CartItemRepository, OrderController, ProductVariantRepository, UserController

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (5): BaseEntity, CartItem, ProductVariant, School, User

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (5): AuthController, JwtAuthFilter, JwtService, OncePerRequestFilter, UserRepository

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (4): AdminDashboardService, OrderRepository, ProductController, ProductRepository

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (13): AdminRoute(), Navbar(), ProtectedRoute(), AuthProvider(), useAuth(), CartProvider(), useCart(), Cart() (+5 more)

## Knowledge Gaps
- **2 isolated node(s):** `RuntimeException`, `PaymentRepository`
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BaseEntity` connect `Community 3` to `Community 0`, `Community 1`, `Community 7`?**
  _High betweenness centrality (0.174) - this node is a cross-community bridge._
- **Why does `Product` connect `Community 0` to `Community 3`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Why does `User` connect `Community 3` to `Community 1`, `Community 4`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Are the 16 inferred relationships involving `from()` (e.g. with `.getOrderNumber()` and `.getOrderStatus()`) actually correct?**
  _`from()` has 16 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `useAuth()` (e.g. with `CartProvider()` and `AdminRoute()`) actually correct?**
  _`useAuth()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **What connects `RuntimeException`, `PaymentRepository` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._